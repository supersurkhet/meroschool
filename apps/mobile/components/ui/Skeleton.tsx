import { useEffect, useRef } from 'react'
import { Animated, View, type ViewStyle } from 'react-native'
import { useTheme } from '@/lib/theme'

interface SkeletonProps {
	width?: number | string
	height?: number
	borderRadius?: number
	style?: ViewStyle
}

/**
 * Animated shimmer placeholder using the Animated API.
 * Pulses between surface and surfaceAlt colors to indicate loading.
 */
export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
	const { colors } = useTheme()
	const opacity = useRef(new Animated.Value(0.3)).current

	useEffect(() => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(opacity, {
					toValue: 1,
					duration: 800,
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 0.3,
					duration: 800,
					useNativeDriver: true,
				}),
			]),
		)
		animation.start()
		return () => animation.stop()
	}, [opacity])

	return (
		<Animated.View
			style={[
				{
					width: width as any,
					height,
					borderRadius,
					backgroundColor: colors.surfaceAlt,
					opacity,
				},
				style,
			]}
		/>
	)
}

/**
 * Pre-composed skeleton layouts for common patterns.
 */
export function SkeletonCard() {
	const { colors } = useTheme()
	return (
		<View
			style={{
				backgroundColor: colors.card,
				borderRadius: 16,
				padding: 16,
				borderWidth: 1,
				borderColor: colors.border,
				gap: 12,
			}}
		>
			<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
				<Skeleton width={48} height={48} borderRadius={24} />
				<View style={{ flex: 1, gap: 8 }}>
					<Skeleton width="70%" height={16} />
					<Skeleton width="40%" height={12} />
				</View>
			</View>
			<Skeleton width="100%" height={14} />
			<Skeleton width="60%" height={14} />
		</View>
	)
}

export function SkeletonList({ count = 3 }: { count?: number }) {
	return (
		<View style={{ gap: 12 }}>
			{Array.from({ length: count }).map((_, i) => (
				<SkeletonCard key={i} />
			))}
		</View>
	)
}
