import { useState, useCallback } from "react"
import { View, Text, FlatList, Pressable, RefreshControl } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useTheme } from "@/lib/theme"
import { ScreenHeader } from "@/components/shared/ScreenHeader"
import { Card } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"

type NotificationType = "attendance_alert" | "test_result" | "assignment_graded" | "general"

interface Notification {
	id: string
	title: string
	body: string
	type: NotificationType
	time: string
	read: boolean
}

const initialNotifications: Notification[] = [
	{
		id: "1",
		title: "Absent Today",
		body: "Aarav was marked absent in Class 10-A today. If this is incorrect, please contact the school.",
		type: "attendance_alert",
		time: "10 min ago",
		read: false,
	},
	{
		id: "2",
		title: "Test Result: Algebra Quiz",
		body: "Aarav scored 85/100 (85%) in Mathematics - Algebra Quiz. Grade: A",
		type: "test_result",
		time: "2 hours ago",
		read: false,
	},
	{
		id: "3",
		title: "Assignment Graded",
		body: "Nepal History Timeline has been graded. Score: 45/50. Grade: A. Feedback: Excellent work!",
		type: "assignment_graded",
		time: "5 hours ago",
		read: false,
	},
	{
		id: "4",
		title: "Fee Payment Reminder",
		body: "Monthly fee for March is due. Please pay before March 25, 2026.",
		type: "general",
		time: "Yesterday",
		read: false,
	},
	{
		id: "5",
		title: "Parent-Teacher Meeting",
		body: "PTM scheduled for March 28, 2026 at 2:00 PM. Please plan to attend.",
		type: "general",
		time: "Yesterday",
		read: true,
	},
	{
		id: "6",
		title: "Late Arrival",
		body: "Aarav was marked late on March 17, 2026. Arrival time: 10:15 AM.",
		type: "attendance_alert",
		time: "Mar 17",
		read: true,
	},
	{
		id: "7",
		title: "Test Result: Grammar Test",
		body: "Aarav scored 78/100 (78%) in Nepali - Grammar Test. Grade: B+",
		type: "test_result",
		time: "Mar 18",
		read: true,
	},
	{
		id: "8",
		title: "Assignment Graded",
		body: "Poem Analysis has been graded. Score: 38/50. Grade: B+. Feedback: Good analysis, work on vocabulary.",
		type: "assignment_graded",
		time: "Mar 15",
		read: true,
	},
	{
		id: "9",
		title: "Holiday Notice",
		body: "School will be closed on March 22, 2026 for Holi festival.",
		type: "general",
		time: "Mar 14",
		read: true,
	},
	{
		id: "10",
		title: "Absent Notification",
		body: "Aarav was marked absent on March 15, 2026. Please contact the school if this is incorrect.",
		type: "attendance_alert",
		time: "Mar 15",
		read: true,
	},
]

export default function ParentNotificationsScreen() {
	const { t } = useTranslation()
	const { colors } = useTheme()
	const [notifications, setNotifications] = useState(initialNotifications)
	const [refreshing, setRefreshing] = useState(false)

	const markAsRead = useCallback((id: string) => {
		setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
	}, [])

	const markAllRead = useCallback(() => {
		setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
	}, [])

	const onRefresh = useCallback(() => {
		setRefreshing(true)
		// Simulate refresh
		setTimeout(() => {
			setRefreshing(false)
		}, 1000)
	}, [])

	const typeConfig: Record<NotificationType, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
		attendance_alert: { icon: "alert-circle", color: colors.danger, bg: colors.dangerLight },
		test_result: { icon: "document-text", color: colors.primary, bg: colors.primaryLight },
		assignment_graded: { icon: "checkmark-circle", color: colors.success, bg: colors.successLight },
		general: { icon: "information-circle", color: colors.textSecondary, bg: colors.surfaceAlt },
	}

	const unreadCount = notifications.filter((n) => !n.read).length

	const renderNotification = useCallback(
		({ item }: { item: Notification }) => {
			const cfg = typeConfig[item.type]
			return (
				<Pressable
					onPress={() => markAsRead(item.id)}
					style={{ paddingHorizontal: 20, marginBottom: 8 }}
				>
					<Card
						style={{
							opacity: item.read ? 0.7 : 1,
							borderLeftWidth: item.read ? 0 : 3,
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
											fontWeight: item.read ? "500" : "700",
											color: colors.text,
											flex: 1,
										}}
									>
										{item.title}
									</Text>
									{!item.read && (
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
									{item.body}
								</Text>
								<Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 6 }}>
									{item.time}
								</Text>
							</View>
						</View>
					</Card>
				</Pressable>
			)
		},
		[colors, typeConfig, markAsRead]
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
			<FlatList
				data={notifications}
				keyExtractor={(item) => item.id}
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
		</View>
	)
}
