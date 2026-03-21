import { useCallback, useEffect, useState } from 'react'
import { convexMutate, convexQuery } from './client'

/**
 * HTTP-based query hook for use outside ConvexProvider or when codegen is unavailable.
 * Prefer useQuery from convex/react when inside a ConvexProvider (real-time subscriptions).
 */
export function useConvexQuery<T>(fn: string, args: Record<string, any> = {}, fallback: T) {
	const [data, setData] = useState<T>(fallback)
	const [loading, setLoading] = useState(true)

	const refetch = useCallback(async () => {
		setLoading(true)
		const result = await convexQuery(fn, args, fallback)
		setData(result)
		setLoading(false)
	}, [fn, JSON.stringify(args)])

	useEffect(() => {
		refetch()
	}, [refetch])

	return { data, loading, refetch }
}

/**
 * HTTP-based mutation hook for use outside ConvexProvider or when codegen is unavailable.
 * Prefer useMutation from convex/react when inside a ConvexProvider.
 */
export function useConvexMutation(fn: string) {
	const [loading, setLoading] = useState(false)

	const trigger = useCallback(
		async (args: Record<string, any> = {}) => {
			setLoading(true)
			try {
				return await convexMutate(fn, args)
			} finally {
				setLoading(false)
			}
		},
		[fn],
	)

	return { trigger, loading }
}
