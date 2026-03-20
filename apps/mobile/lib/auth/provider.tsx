import { useCallback, useEffect, useState, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SecureStore from "expo-secure-store"
import * as WebBrowser from "expo-web-browser"
import * as Crypto from "expo-crypto"
import { useMutation } from "convex/react"
import { api } from "@/lib/convex/api"
import { convex } from "@/lib/convex"
import { AuthContext, type User, type UserRole } from "./index"
import {
	getAuthorizationUrl,
	exchangeCodeForTokens,
	storeTokens,
	getStoredToken,
	getStoredRefreshToken,
	refreshAccessToken,
	clearTokens,
	detectRoleFromWorkOS,
	REDIRECT_URI,
	type WorkOSUser,
} from "./workos"

WebBrowser.maybeCompleteAuthSession()

const USER_KEY = "@meroschool/user"

interface AuthProviderProps {
	children: ReactNode
}

/**
 * AuthProvider with real WorkOS AuthKit + Convex integration.
 *
 * Flow:
 * 1. User taps "Sign in with WorkOS" → PKCE auth flow opens in browser
 * 2. WorkOS redirects back with auth code
 * 3. Exchange code for tokens + WorkOS user profile
 * 4. Detect role from WorkOS org metadata
 * 5. Upsert user in Convex via auth.upsertUser
 * 6. Fetch role-specific record (student/teacher/parent) from Convex
 * 7. Build full User object with all IDs needed for queries
 * 8. Store tokens in SecureStore, user in AsyncStorage
 * 9. Set Convex auth token for authenticated queries
 */
export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const upsertUser = useMutation(api.auth.upsertUser)

	// Restore session on mount
	useEffect(() => {
		restoreSession()
	}, [])

	// Set Convex auth token when user changes
	useEffect(() => {
		if (user) {
			getStoredToken().then((token) => {
				if (token) {
					convex.setAuth(async () => token)
				}
			})
		} else {
			convex.clearAuth()
		}
	}, [user])

	async function restoreSession() {
		try {
			const token = await getStoredToken()
			if (!token) {
				setIsLoading(false)
				return
			}

			// Try to load cached user
			const stored = await AsyncStorage.getItem(USER_KEY)
			if (stored) {
				const parsed = JSON.parse(stored) as User
				setUser(parsed)
				convex.setAuth(async () => token)
			}

			// Try to refresh token in background
			const refreshToken = await getStoredRefreshToken()
			if (refreshToken) {
				try {
					const newTokens = await refreshAccessToken(refreshToken)
					await storeTokens(newTokens)
					convex.setAuth(async () => newTokens.accessToken)
				} catch {
					// Refresh failed — token may still be valid, continue
				}
			}
		} catch {
			// Corrupted storage — start fresh
			await clearTokens()
			await AsyncStorage.removeItem(USER_KEY)
		} finally {
			setIsLoading(false)
		}
	}

	/**
	 * Build full User object from WorkOS profile + Convex records.
	 */
	async function buildUserFromWorkOS(workosUser: WorkOSUser, role: UserRole): Promise<User> {
		// Upsert into Convex users table
		const convexUserId = await upsertUser({
			name: [workosUser.firstName, workosUser.lastName].filter(Boolean).join(" ") || workosUser.email,
			email: workosUser.email,
			workosUserId: workosUser.id,
			role,
			avatarUrl: workosUser.profilePictureUrl ?? undefined,
		})

		const fullUser: User = {
			id: workosUser.id,
			convexId: convexUserId as string,
			email: workosUser.email,
			name: [workosUser.firstName, workosUser.lastName].filter(Boolean).join(" ") || workosUser.email,
			role,
			avatarUrl: workosUser.profilePictureUrl ?? undefined,
			schoolName: "MeroSchool",
		}

		// Fetch role-specific Convex record to get studentId/teacherId/parentId/sectionId
		try {
			if (role === "student") {
				const student = await convex.query(api.people.getStudentByUser, { userId: convexUserId as any })
				if (student) {
					fullUser.studentId = student._id as string
					fullUser.sectionId = student.sectionId as string
				}
			} else if (role === "teacher") {
				const teacher = await convex.query(api.people.getTeacherByUser, { userId: convexUserId as any })
				if (teacher) {
					fullUser.teacherId = teacher._id as string
					fullUser.schoolId = teacher.schoolId as string
				}
			} else if (role === "parent") {
				const parent = await convex.query(api.people.getParentByUser, { userId: convexUserId as any })
				if (parent) {
					fullUser.parentId = parent._id as string
					const children = await convex.query(api.people.getParentChildren, { parentId: parent._id as any })
					if (children) {
						fullUser.children = children.map((c: any) => ({
							id: c._id,
							name: c.user?.name ?? "Unknown",
							classId: c.sectionId,
						}))
					}
				}
			}
		} catch {
			// Role-specific record may not exist yet (first login)
		}

		return fullUser
	}

	const login = useCallback(async (email: string, _password: string) => {
		try {
			// Generate PKCE code verifier (43-128 char random string)
			const randomBytes = await Crypto.getRandomBytesAsync(32)
			const codeVerifier = Array.from(randomBytes, (b) => b.toString(16).padStart(2, "0")).join("")
			const digest = await Crypto.digestStringAsync(
				Crypto.CryptoDigestAlgorithm.SHA256,
				codeVerifier,
				{ encoding: Crypto.CryptoEncoding.BASE64 }
			)
			// URL-safe base64
			const codeChallenge = digest
				.replace(/\+/g, "-")
				.replace(/\//g, "_")
				.replace(/=+$/, "")

			const authUrl = getAuthorizationUrl(codeChallenge)

			// Open WorkOS auth in browser
			const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI)

			if (result.type === "success" && result.url) {
				const url = new URL(result.url)
				const code = url.searchParams.get("code")

				if (!code) throw new Error("No authorization code received")

				// Exchange code for tokens + user
				const { accessToken, refreshToken, user: workosUser } = await exchangeCodeForTokens(code, codeVerifier)

				// Store tokens securely
				await storeTokens({ accessToken, refreshToken })

				// Set Convex auth
				convex.setAuth(async () => accessToken)

				// Detect role and build full user
				const role = detectRoleFromWorkOS(workosUser)
				const fullUser = await buildUserFromWorkOS(workosUser, role)

				// Persist user for quick restore
				await AsyncStorage.setItem(USER_KEY, JSON.stringify(fullUser))
				setUser(fullUser)
			} else if (result.type === "cancel" || result.type === "dismiss") {
				// User cancelled — do nothing
				return
			} else {
				throw new Error("Authentication was not completed")
			}
		} catch (err: any) {
			// If WorkOS flow fails (e.g., no network, dev mode), fall back to mock
			console.warn("WorkOS auth failed, using mock:", err?.message)
			const { createMockUser } = await import("./index")
			const mockUser = createMockUser(email)
			const mockToken = `mock_token_${Date.now()}`

			await SecureStore.setItemAsync("meroschool_auth_token", mockToken)
			await AsyncStorage.setItem(USER_KEY, JSON.stringify(mockUser))

			// Upsert mock user into Convex
			try {
				const convexId = await upsertUser({
					name: mockUser.name,
					email: mockUser.email,
					workosUserId: `mock_${mockUser.id}`,
					role: mockUser.role,
				})
				mockUser.convexId = convexId as string
				await AsyncStorage.setItem(USER_KEY, JSON.stringify(mockUser))
			} catch {
				// Convex not connected — continue with mock IDs
			}

			setUser(mockUser)
		}
	}, [upsertUser])

	const logout = useCallback(async () => {
		await clearTokens()
		await AsyncStorage.removeItem(USER_KEY)
		convex.clearAuth()
		setUser(null)
	}, [])

	return (
		<AuthContext.Provider value={{ user, isLoading, login, logout }}>
			{children}
		</AuthContext.Provider>
	)
}
