import { useState, useEffect, useCallback } from "react"
import { View, Text, Pressable, StyleSheet, Animated } from "react-native"
import { useRouter } from "expo-router"
import { CameraView, useCameraPermissions } from "expo-camera"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTranslation } from "react-i18next"
import { useTheme } from "@/lib/theme"
import { Button } from "@/components/ui/Button"

type ScanState = "scanning" | "success" | "error"
type ErrorType = "expired" | "wrong_section" | "already_marked" | "invalid"

const VALID_SECTIONS = ["Class 10-A", "Class 10-B", "Class 9-A"]
const STUDENT_SECTION = "Class 10-A"

function validateQR(data: string): { valid: boolean; errorType?: ErrorType; section?: string } {
	// Expected format: meroschool://attendance/{section}/{timestamp}
	const match = data.match(/meroschool:\/\/attendance\/(.+?)\/(\d+)/)
	if (!match) {
		// Also support class QR: meroschool://class/{classId}
		const classMatch = data.match(/meroschool:\/\/class\/(.+)/)
		if (classMatch) {
			return { valid: true, section: classMatch[1] }
		}
		return { valid: false, errorType: "invalid" }
	}

	const section = match[1]
	const timestamp = parseInt(match[2], 10)
	const now = Date.now()
	const fiveMinutes = 5 * 60 * 1000

	// Check if QR is expired (older than 5 minutes)
	if (now - timestamp > fiveMinutes) {
		return { valid: false, errorType: "expired" }
	}

	// Check section match
	if (section !== STUDENT_SECTION) {
		return { valid: false, errorType: "wrong_section", section }
	}

	return { valid: true, section }
}

export default function QRScanScreen() {
	const { t } = useTranslation()
	const { colors } = useTheme()
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const [permission, requestPermission] = useCameraPermissions()
	const [scanState, setScanState] = useState<ScanState>("scanning")
	const [errorType, setErrorType] = useState<ErrorType | null>(null)
	const [scannedSection, setScannedSection] = useState<string | null>(null)
	const [pulseAnim] = useState(() => new Animated.Value(1))

	useEffect(() => {
		if (scanState === "success") {
			Animated.sequence([
				Animated.timing(pulseAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
				Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
				Animated.timing(pulseAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
				Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
			]).start()
		}
	}, [scanState, pulseAnim])

	const handleBarCodeScanned = useCallback(({ data }: { data: string }) => {
		if (scanState !== "scanning") return

		const result = validateQR(data)
		if (result.valid) {
			setScanState("success")
			setScannedSection(result.section ?? null)
		} else {
			setScanState("error")
			setErrorType(result.errorType ?? "invalid")
			setScannedSection(result.section ?? null)
		}
	}, [scanState])

	const resetScan = useCallback(() => {
		setScanState("scanning")
		setErrorType(null)
		setScannedSection(null)
	}, [])

	const errorMessages: Record<ErrorType, { title: string; message: string }> = {
		expired: { title: "QR Expired", message: "This QR code has expired. Ask your teacher to generate a new one." },
		wrong_section: {
			title: "Wrong Section",
			message: `This QR is for ${scannedSection ?? "another section"}. You are in ${STUDENT_SECTION}.`,
		},
		already_marked: { title: "Already Marked", message: "Your attendance has already been marked for this session." },
		invalid: { title: "Invalid QR", message: "This is not a valid meroschool attendance QR code." },
	}

	if (!permission) {
		return <View style={{ flex: 1, backgroundColor: colors.bg }} />
	}

	if (!permission.granted) {
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: colors.bg,
					alignItems: "center",
					justifyContent: "center",
					padding: 40,
				}}
			>
				<Ionicons name="camera-outline" size={64} color={colors.textMuted} />
				<Text
					style={{
						fontSize: 18,
						fontWeight: "600",
						color: colors.text,
						marginTop: 20,
						textAlign: "center",
					}}
				>
					Camera Permission Required
				</Text>
				<Text
					style={{
						fontSize: 14,
						color: colors.textSecondary,
						marginTop: 8,
						textAlign: "center",
					}}
				>
					{t("qr.pointCamera")}
				</Text>
				<Button title="Grant Permission" onPress={requestPermission} style={{ marginTop: 24 }} />
				<Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
					<Text style={{ fontSize: 14, color: colors.primary }}>Go Back</Text>
				</Pressable>
			</View>
		)
	}

	// Success overlay
	if (scanState === "success") {
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: colors.bg,
					alignItems: "center",
					justifyContent: "center",
					padding: 40,
				}}
			>
				<Animated.View
					style={{
						transform: [{ scale: pulseAnim }],
						width: 120,
						height: 120,
						borderRadius: 60,
						backgroundColor: colors.successLight,
						alignItems: "center",
						justifyContent: "center",
						marginBottom: 24,
					}}
				>
					<Ionicons name="checkmark-circle" size={64} color={colors.success} />
				</Animated.View>
				<Text style={{ fontSize: 24, fontWeight: "800", color: colors.success }}>
					Attendance Marked!
				</Text>
				<Text
					style={{
						fontSize: 15,
						color: colors.textSecondary,
						marginTop: 8,
						textAlign: "center",
					}}
				>
					{scannedSection ?? STUDENT_SECTION} — {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
				</Text>
				<Button
					title="Done"
					onPress={() => router.back()}
					style={{ marginTop: 32, width: 200 }}
				/>
			</View>
		)
	}

	// Error overlay
	if (scanState === "error" && errorType) {
		const err = errorMessages[errorType]
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: colors.bg,
					alignItems: "center",
					justifyContent: "center",
					padding: 40,
				}}
			>
				<View
					style={{
						width: 100,
						height: 100,
						borderRadius: 50,
						backgroundColor: colors.dangerLight,
						alignItems: "center",
						justifyContent: "center",
						marginBottom: 24,
					}}
				>
					<Ionicons name="close-circle" size={56} color={colors.danger} />
				</View>
				<Text style={{ fontSize: 22, fontWeight: "700", color: colors.danger }}>
					{err.title}
				</Text>
				<Text
					style={{
						fontSize: 15,
						color: colors.textSecondary,
						marginTop: 8,
						textAlign: "center",
						lineHeight: 22,
					}}
				>
					{err.message}
				</Text>
				<View style={{ flexDirection: "row", gap: 12, marginTop: 32 }}>
					<Button title="Try Again" onPress={resetScan} style={{ flex: 1 }} />
					<Button title="Go Back" variant="outline" onPress={() => router.back()} style={{ flex: 1 }} />
				</View>
			</View>
		)
	}

	return (
		<View style={{ flex: 1, backgroundColor: "#000" }}>
			<CameraView
				style={StyleSheet.absoluteFill}
				facing="back"
				barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
				onBarcodeScanned={scanState === "scanning" ? handleBarCodeScanned : undefined}
			/>

			{/* Overlay */}
			<View style={[StyleSheet.absoluteFill, { justifyContent: "space-between" }]}>
				{/* Top bar */}
				<View
					style={{
						paddingTop: insets.top + 12,
						paddingHorizontal: 20,
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Pressable
						onPress={() => router.back()}
						style={{
							width: 40,
							height: 40,
							borderRadius: 20,
							backgroundColor: "rgba(0,0,0,0.5)",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Ionicons name="arrow-back" size={22} color="#FFF" />
					</Pressable>
					<Text style={{ fontSize: 18, fontWeight: "700", color: "#FFF" }}>
						{t("qr.scanQR")}
					</Text>
					<View style={{ width: 40 }} />
				</View>

				{/* Center frame */}
				<View style={{ alignItems: "center" }}>
					<View
						style={{
							width: 240,
							height: 240,
							borderRadius: 24,
							borderWidth: 3,
							borderColor: "#FFF",
							backgroundColor: "transparent",
						}}
					>
						{/* Corner accents */}
						<View
							style={{
								position: "absolute",
								top: -2,
								left: -2,
								width: 30,
								height: 30,
								borderTopWidth: 4,
								borderLeftWidth: 4,
								borderColor: colors.primary,
								borderTopLeftRadius: 24,
							}}
						/>
						<View
							style={{
								position: "absolute",
								top: -2,
								right: -2,
								width: 30,
								height: 30,
								borderTopWidth: 4,
								borderRightWidth: 4,
								borderColor: colors.primary,
								borderTopRightRadius: 24,
							}}
						/>
						<View
							style={{
								position: "absolute",
								bottom: -2,
								left: -2,
								width: 30,
								height: 30,
								borderBottomWidth: 4,
								borderLeftWidth: 4,
								borderColor: colors.primary,
								borderBottomLeftRadius: 24,
							}}
						/>
						<View
							style={{
								position: "absolute",
								bottom: -2,
								right: -2,
								width: 30,
								height: 30,
								borderBottomWidth: 4,
								borderRightWidth: 4,
								borderColor: colors.primary,
								borderBottomRightRadius: 24,
							}}
						/>
					</View>
					<Text
						style={{
							fontSize: 14,
							color: "rgba(255,255,255,0.8)",
							marginTop: 20,
							textAlign: "center",
						}}
					>
						Point camera at attendance QR code
					</Text>
				</View>

				{/* Bottom info */}
				<View
					style={{
						paddingBottom: insets.bottom + 24,
						alignItems: "center",
						gap: 8,
					}}
				>
					<View
						style={{
							backgroundColor: "rgba(0,0,0,0.6)",
							paddingHorizontal: 16,
							paddingVertical: 8,
							borderRadius: 10,
						}}
					>
						<Text style={{ fontSize: 13, color: "#FFF", fontWeight: "500" }}>
							Section: {STUDENT_SECTION}
						</Text>
					</View>
				</View>
			</View>
		</View>
	)
}
