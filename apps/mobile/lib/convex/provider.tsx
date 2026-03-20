import { type ReactNode } from "react"
import { ConvexProvider as ConvexReactProvider } from "convex/react"
import { convex } from "../convex"

interface ConvexProviderProps {
	children: ReactNode
}

/**
 * ConvexProvider wraps children with the ConvexReactClient.
 *
 * Uses EXPO_PUBLIC_CONVEX_URL from environment.
 * Auth token is set via convex.setAuth() in AuthProvider.
 */
export function ConvexProviderWrapper({ children }: ConvexProviderProps) {
	return (
		<ConvexReactProvider client={convex}>
			{children}
		</ConvexReactProvider>
	)
}
