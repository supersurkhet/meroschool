import { useState } from "react"
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth"
import { useTheme } from "@/lib/theme"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export default function LoginScreen() {
	const { t } = useTranslation()
	const { login } = useAuth()
	const { colors, isDark, toggle } = useTheme()
	const insets = useSafeAreaInsets()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")

	const handleLogin = async () => {
		if (!email.trim()) {
			setError("Email is required")
			return
		}
		setLoading(true)
		setError("")
		try {
			await login(email.trim(), password)
		} catch (err: any) {
			setError(err?.message ?? t("common.error"))
		} finally {
			setLoading(false)
		}
	}

	return (
		<KeyboardAvoidingView
			style={{ flex: 1, backgroundColor: colors.bg }}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
					justifyContent: "center",
					paddingHorizontal: 24,
					paddingTop: insets.top + 20,
					paddingBottom: insets.bottom + 20,
				}}
				keyboardShouldPersistTaps="handled"
			>
				{/* Theme toggle */}
				<Pressable
					onPress={toggle}
					style={{ position: "absolute", top: insets.top + 16, right: 24 }}
				>
					<Ionicons
						name={isDark ? "sunny-outline" : "moon-outline"}
						size={24}
						color={colors.textSecondary}
					/>
				</Pressable>

				{/* Logo & Branding */}
				<View style={{ alignItems: "center", marginBottom: 48 }}>
					<View
						style={{
							width: 80,
							height: 80,
							borderRadius: 24,
							backgroundColor: colors.primary,
							alignItems: "center",
							justifyContent: "center",
							marginBottom: 20,
						}}
					>
						<Ionicons name="school" size={40} color="#FFFFFF" />
					</View>
					<Text style={{ fontSize: 32, fontWeight: "800", color: colors.text }}>
						MeroSchool
					</Text>
					<Text
						style={{
							fontSize: 15,
							color: colors.textSecondary,
							marginTop: 6,
							textAlign: "center",
						}}
					>
						{t("auth.loginSubtitle")}
					</Text>
				</View>

				{/* Login Form */}
				<View style={{ gap: 16 }}>
					<Input
						label={t("auth.email")}
						placeholder="student@school.edu.np"
						value={email}
						onChangeText={setEmail}
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						icon={<Ionicons name="mail-outline" size={20} color={colors.textMuted} />}
					/>
					<Input
						label={t("auth.password")}
						placeholder="••••••••"
						value={password}
						onChangeText={setPassword}
						secureTextEntry
						icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />}
					/>

					{error ? (
						<Text style={{ fontSize: 13, color: colors.danger, textAlign: "center" }}>
							{error}
						</Text>
					) : null}

					{/* Primary: WorkOS SSO button */}
					<Button
						title="Sign in with WorkOS"
						onPress={handleLogin}
						loading={loading}
						size="lg"
						icon={!loading ? <Ionicons name="shield-checkmark" size={18} color="#FFF" /> : undefined}
					/>

					<Text style={{ fontSize: 12, color: colors.textMuted, textAlign: "center" }}>
						Secure sign-in powered by WorkOS AuthKit
					</Text>
				</View>

				{/* Footer */}
				<View style={{ alignItems: "center", marginTop: 32 }}>
					<Text style={{ fontSize: 13, color: colors.textMuted }}>
						{t("auth.noAccount")}
					</Text>
					<Pressable style={{ marginTop: 4 }}>
						<Text style={{ fontSize: 13, color: colors.primary, fontWeight: "600" }}>
							{t("auth.contactSchool")}
						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
