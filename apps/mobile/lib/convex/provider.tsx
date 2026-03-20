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
 * Auth token integration: once WorkOS is wired up,
 * pass the auth token via convex.setAuth() for authenticated queries.
 */
export function ConvexProviderWrapper({ children }: ConvexProviderProps) {
	return (
		<ConvexReactProvider client={convex}>
			{children}
		</ConvexReactProvider>
	)
}
