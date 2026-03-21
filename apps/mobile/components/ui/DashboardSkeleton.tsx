import { View } from 'react-native'
import { useTheme } from '@/lib/theme'
import { Skeleton, SkeletonCard } from './Skeleton'

export function DashboardSkeleton() {
	const { colors } = useTheme()
	return (
		<View style={{ padding: 20, gap: 20 }}>
			{/* Stats row */}
			<View style={{ flexDirection: 'row', gap: 12 }}>
				<View
					style={{
						flex: 1,
						backgroundColor: colors.card,
						borderRadius: 16,
						padding: 16,
						borderWidth: 1,
						borderColor: colors.border,
						gap: 10,
					}}
				>
					<Skeleton width={44} height={44} borderRadius={12} />
					<Skeleton width="60%" height={24} />
					<Skeleton width="40%" height={12} />
				</View>
				<View
					style={{
						flex: 1,
						backgroundColor: colors.card,
						borderRadius: 16,
						padding: 16,
						borderWidth: 1,
						borderColor: colors.border,
						gap: 10,
					}}
				>
					<Skeleton width={44} height={44} borderRadius={12} />
					<Skeleton width="50%" height={24} />
					<Skeleton width="45%" height={12} />
				</View>
			</View>
			{/* Section header */}
			<Skeleton width="40%" height={18} />
			{/* Cards */}
			<SkeletonCard />
			<SkeletonCard />
			<SkeletonCard />
		</View>
	)
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
	const { colors } = useTheme()
	return (
		<View style={{ padding: 20, gap: 10 }}>
			{Array.from({ length: count }).map((_, i) => (
				<View
					key={i}
					style={{
						backgroundColor: colors.card,
						borderRadius: 16,
						padding: 16,
						borderWidth: 1,
						borderColor: colors.border,
						flexDirection: 'row',
						alignItems: 'center',
						gap: 12,
					}}
				>
					<Skeleton width={44} height={44} borderRadius={12} />
					<View style={{ flex: 1, gap: 8 }}>
						<Skeleton width="65%" height={16} />
						<Skeleton width="40%" height={12} />
					</View>
					<Skeleton width={50} height={24} borderRadius={8} />
				</View>
			))}
		</View>
	)
}
