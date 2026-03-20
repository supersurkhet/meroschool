import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
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
} from "./workos"

WebBrowser.maybeCompleteAuthSession()

const USER_KEY = "@meroschool/user"
const TOKEN_REFRESH_INTERVAL = 45 * 60 * 1000 // 45 minutes

interface AuthProviderProps {
	children: ReactNode
}

/**
 * Fetch role-specific Convex record (student/teacher/parent) and
 * populate the User object with real Convex document IDs.
 */
async function resolveRoleIds(convexUserId: string, role: UserRole): Promise<Partial<User>> {
	const ids: Partial<User> = {}
	try {
		if (role === "student") {
			const student = await convex.query(api.people.getStudentByUser, { userId: convexUserId as any })
			if (student) {
				ids.studentId = student._id as string
				ids.sectionId = student.sectionId as string
			}
		} else if (role === "teacher") {
			const teacher = await convex.query(api.people.getTeacherByUser, { userId: convexUserId as any })
			if (teacher) {
				ids.teacherId = teacher._id as string
				ids.schoolId = teacher.schoolId as string
			}
		} else if (role === "parent") {
			const parent = await convex.query(api.people.getParentByUser, { userId: convexUserId as any })
			if (parent) {
				ids.parentId = parent._id as string
				const children = await convex.query(api.people.getParentChildren, { parentId: parent._id as any })
				if (children) {
					ids.children = children.map((c: any) => ({
						id: c._id,
						name: c.user?.name ?? "Unknown",
						classId: c.sectionId,
					}))
				}
			}
		}
	} catch {
		// Role record may not exist yet (first login — admin must create it)
	}
	return ids
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const upsertUser = useMutation(api.auth.upsertUser)
	const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

	// Restore session on mount
	useEffect(() => {
		restoreSession()
		return () => {
			if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
		}
	}, [])

	// Sync Convex auth token whenever user changes
	useEffect(() => {
		if (user) {
			getStoredToken().then((token) => {
				if (token) convex.setAuth(async () => token)
			})
		} else {
			convex.clearAuth()
		}
	}, [user])

	/**
	 * Schedule periodic token refresh so sessions survive long usage.
	 */
	function startTokenRefreshTimer() {
		if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
		refreshTimerRef.current = setInterval(async () => {
			try {
				const rt = await getStoredRefreshToken()
				if (!rt) return
				const newTokens = await refreshAccessToken(rt)
				await storeTokens(newTokens)
				convex.setAuth(async () => newTokens.accessToken)
			} catch {
				// Silent fail — next interval will retry, or user will re-login
			}
		}, TOKEN_REFRESH_INTERVAL)
	}

	async function restoreSession() {
		try {
			const token = await getStoredToken()
			if (!token) {
				setIsLoading(false)
				return
			}

			// Load cached user immediately for fast startup
			const stored = await AsyncStorage.getItem(USER_KEY)
			if (stored) {
				const parsed = JSON.parse(stored) as User
				setUser(parsed)
				convex.setAuth(async () => token)
			}

			// Refresh token in background
			const refreshToken = await getStoredRefreshToken()
			if (refreshToken) {
				try {
					const newTokens = await refreshAccessToken(refreshToken)
					await storeTokens(newTokens)
					convex.setAuth(async () => newTokens.accessToken)

					// Re-resolve role IDs in case they changed (e.g., admin assigned student to new section)
					if (stored) {
						const parsed = JSON.parse(stored) as User
						if (parsed.convexId) {
							const freshIds = await resolveRoleIds(parsed.convexId, parsed.role)
							const updated = { ...parsed, ...freshIds }
							await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated))
							setUser(updated)
						}
					}
				} catch {
					// Refresh failed — if token is expired, force re-login
					const testResult = await convex.query(api.auth.currentUser, {}).catch(() => null)
					if (!testResult) {
						await clearTokens()
						await AsyncStorage.removeItem(USER_KEY)
						setUser(null)
						setIsLoading(false)
						return
					}
				}
			}

			startTokenRefreshTimer()
		} catch {
			await clearTokens()
			await AsyncStorage.removeItem(USER_KEY)
		} finally {
			setIsLoading(false)
		}
	}

	const login = useCallback(async (_email: string, _password: string) => {
		// Generate PKCE verifier + challenge
		const randomBytes = await Crypto.getRandomBytesAsync(32)
		const codeVerifier = Array.from(randomBytes, (b) => b.toString(16).padStart(2, "0")).join("")
		const digest = await Crypto.digestStringAsync(
			Crypto.CryptoDigestAlgorithm.SHA256,
			codeVerifier,
			{ encoding: Crypto.CryptoEncoding.BASE64 }
		)
		const codeChallenge = digest.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

		const authUrl = getAuthorizationUrl(codeChallenge)
		const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI)

		if (result.type === "cancel" || result.type === "dismiss") return
		if (result.type !== "success" || !result.url) {
			throw new Error("Authentication was not completed")
		}

		const url = new URL(result.url)
		const code = url.searchParams.get("code")
		if (!code) throw new Error("No authorization code received")

		// Exchange code for tokens + WorkOS user profile
		const { accessToken, refreshToken, user: workosUser } = await exchangeCodeForTokens(code, codeVerifier)
		await storeTokens({ accessToken, refreshToken })
		convex.setAuth(async () => accessToken)

		// Detect role from WorkOS metadata
		const role = detectRoleFromWorkOS(workosUser)

		// Upsert into Convex users table
		const convexUserId = await upsertUser({
			name: [workosUser.firstName, workosUser.lastName].filter(Boolean).join(" ") || workosUser.email,
			email: workosUser.email,
			workosUserId: workosUser.id,
			role,
			avatarUrl: workosUser.profilePictureUrl ?? undefined,
		})

		// Resolve role-specific IDs from Convex
		const roleIds = await resolveRoleIds(convexUserId as string, role)

		const fullUser: User = {
			id: workosUser.id,
			convexId: convexUserId as string,
			email: workosUser.email,
			name: [workosUser.firstName, workosUser.lastName].filter(Boolean).join(" ") || workosUser.email,
			role,
			avatarUrl: workosUser.profilePictureUrl ?? undefined,
			schoolName: "MeroSchool",
			...roleIds,
		}

		await AsyncStorage.setItem(USER_KEY, JSON.stringify(fullUser))
		setUser(fullUser)
		startTokenRefreshTimer()
	}, [upsertUser])

	const logout = useCallback(async () => {
		if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
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
