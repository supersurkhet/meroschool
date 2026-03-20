import { useCallback, useState } from "react"
import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex/api"
import { useAuth } from "@/lib/auth"
import { useTheme } from "@/lib/theme"
import { ScreenHeader } from "@/components/shared/ScreenHeader"
import { Card } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"

type NotificationType = "attendance_alert" | "test_result" | "assignment_graded" | "general"

export default function ParentNotificationsScreen() {
	const { t } = useTranslation()
	const { user } = useAuth()
	const { colors } = useTheme()
	const [refreshing, setRefreshing] = useState(false)

	// Convex queries & mutations
	const notifications = useQuery(
		api.notifications.listAll,
		user?.convexId ? { userId: user.convexId as any } : "skip",
	)

	const unreadData = useQuery(
		api.notifications.unreadCount,
		user?.convexId ? { userId: user.convexId as any } : "skip",
	)

	const markReadMutation = useMutation(api.notifications.markRead)
	const markAllReadMutation = useMutation(api.notifications.markAllRead)

	const unreadCount = unreadData ?? 0

	const markAsRead = useCallback(
		async (id: string) => {
			try {
				await markReadMutation({ notificationId: id as any })
			} catch {
				// optimistic: ignore errors silently
			}
		},
		[markReadMutation],
	)

	const markAllRead = useCallback(async () => {
		if (!user?.convexId) return
		try {
			await markAllReadMutation({ userId: user.convexId as any })
		} catch {
			// ignore
		}
	}, [markAllReadMutation, user?.convexId])

	const onRefresh = useCallback(() => {
		// Convex subscriptions auto-update; just show brief spinner for UX
		setRefreshing(true)
		const timer = setTimeout(() => setRefreshing(false), 800)
		return () => clearTimeout(timer)
	}, [])

	const typeConfig: Record<NotificationType, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
		attendance_alert: { icon: "alert-circle", color: colors.danger, bg: colors.dangerLight },
		test_result: { icon: "document-text", color: colors.primary, bg: colors.primaryLight },
		assignment_graded: { icon: "checkmark-circle", color: colors.success, bg: colors.successLight },
		general: { icon: "information-circle", color: colors.textSecondary, bg: colors.surfaceAlt },
	}

	const renderNotification = useCallback(
		({ item }: { item: any }) => {
			const rawType: string = item.type ?? "general"
			const notifType: NotificationType =
				rawType === "attendance_alert" ||
				rawType === "test_result" ||
				rawType === "assignment_graded"
					? (rawType as NotificationType)
					: "general"
			const cfg = typeConfig[notifType]
			const isRead: boolean = item.read ?? item.isRead ?? false

			// Relative time: prefer item.time string, fall back to formatting _creationTime
			const timeDisplay: string = item.time ?? (
				item._creationTime
					? (() => {
							const diff = Date.now() - item._creationTime
							const minutes = Math.floor(diff / 60000)
							if (minutes < 60) return `${minutes} min ago`
							const hours = Math.floor(minutes / 60)
							if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`
							const days = Math.floor(hours / 24)
							if (days === 1) return "Yesterday"
							return `${days} days ago`
						})()
					: ""
			)

			return (
				<Pressable
					onPress={() => markAsRead(item._id ?? item.id)}
					style={{ paddingHorizontal: 20, marginBottom: 8 }}
				>
					<Card
						style={{
							opacity: isRead ? 0.7 : 1,
							borderLeftWidth: isRead ? 0 : 3,
							borderLeftColor: cfg.color,
						}}
					>
						<View style={{ flexDirection: "row", gap: 12 }}>
							<View
								style={{
									width: 40,
									height: 40,
									borderRadius: 10,
									backgroundColor: cfg.bg,
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Ionicons name={cfg.icon} size={20} color={cfg.color} />
							</View>
							<View style={{ flex: 1 }}>
								<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
									<Text
										style={{
											fontSize: 14,
											fontWeight: isRead ? "500" : "700",
											color: colors.text,
											flex: 1,
										}}
									>
										{item.title}
									</Text>
									{!isRead && (
										<View
											style={{
												width: 8,
												height: 8,
												borderRadius: 4,
												backgroundColor: cfg.color,
												marginLeft: 8,
											}}
										/>
									)}
								</View>
								<Text
									style={{
										fontSize: 13,
										color: colors.textSecondary,
										marginTop: 4,
										lineHeight: 18,
									}}
								>
									{item.body ?? item.message ?? ""}
								</Text>
								<Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 6 }}>
									{timeDisplay}
								</Text>
							</View>
						</View>
					</Card>
				</Pressable>
			)
		},
		[colors, typeConfig, markAsRead],
	)

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader
				title={t("parent.notifications")}
				subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
				right={
					unreadCount > 0 ? (
						<Pressable
							onPress={markAllRead}
							style={{
								paddingHorizontal: 12,
								paddingVertical: 6,
								borderRadius: 8,
								backgroundColor: colors.successLight,
							}}
						>
							<Text style={{ fontSize: 12, fontWeight: "600", color: colors.success }}>
								{t("parent.markRead")}
							</Text>
						</Pressable>
					) : undefined
				}
			/>
			{notifications === undefined ? (
				<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
					<ActivityIndicator color={colors.primary} />
				</View>
			) : (
				<FlatList
					data={notifications}
					keyExtractor={(item: any) => item._id ?? item.id}
					renderItem={renderNotification}
					contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
							tintColor={colors.primary}
						/>
					}
					ListEmptyComponent={
						<EmptyState
							icon="notifications-off-outline"
							title="No Notifications"
							subtitle="You're all caught up! New notifications will appear here."
						/>
					}
				/>
			)}
		</View>
	)
}
