import { useCallback, useEffect, useState, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SecureStore from "expo-secure-store"
import * as WebBrowser from "expo-web-browser"
import { AuthContext, createMockUser, type User } from "./index"

const USER_KEY = "@meroschool/user"
const TOKEN_KEY = "meroschool_auth_token"

WebBrowser.maybeCompleteAuthSession()

interface AuthProviderProps {
	children: ReactNode
}

/**
 * AuthProvider wraps the app with authentication context.
 *
 * Currently uses mock auth for development.
 * Production: swap to WorkOS AuthKit redirect flow via expo-auth-session.
 * Tokens are stored securely with expo-secure-store.
 */
export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		loadStoredUser()
	}, [])

	async function loadStoredUser() {
		try {
			const token = await SecureStore.getItemAsync(TOKEN_KEY)
			if (token) {
				const stored = await AsyncStorage.getItem(USER_KEY)
				if (stored) {
					setUser(JSON.parse(stored))
				}
			}
		} catch {
			// Token or user data corrupted — start fresh
		} finally {
			setIsLoading(false)
		}
	}

	const login = useCallback(async (email: string, _password: string) => {
		// TODO: Replace with WorkOS AuthKit flow:
		// 1. Use expo-auth-session to create auth request
		// 2. Redirect to WorkOS hosted auth page
		// 3. Handle callback and exchange code for tokens
		// 4. Store tokens in SecureStore
		// 5. Fetch user profile from WorkOS

		// Mock implementation for development
		const mockUser = createMockUser(email)
		const mockToken = `mock_token_${Date.now()}`

		await SecureStore.setItemAsync(TOKEN_KEY, mockToken)
		await AsyncStorage.setItem(USER_KEY, JSON.stringify(mockUser))
		setUser(mockUser)
	}, [])

	const logout = useCallback(async () => {
		await SecureStore.deleteItemAsync(TOKEN_KEY)
		await AsyncStorage.removeItem(USER_KEY)
		setUser(null)
	}, [])

	return (
		<AuthContext.Provider value={{ user, isLoading, login, logout }}>
			{children}
		</AuthContext.Provider>
	)
}
