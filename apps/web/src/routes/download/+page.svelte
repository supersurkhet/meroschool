<script lang="ts">
	import { t } from "$lib/i18n/index.js";
	import Button from "$lib/components/ui/button.svelte";
	import Card from "$lib/components/ui/card.svelte";
	import Badge from "$lib/components/ui/badge.svelte";
	import { onMount } from "svelte";

	type Platform = "macos" | "windows" | "linux" | "android" | "ios" | "unknown";
	type Role = "student" | "teacher" | "parent" | "admin";

	let detectedPlatform = $state<Platform>("unknown");
	let selectedRole = $state<Role>("student");

	const RELEASES_URL = "https://github.com/supersurkhet/meroschool/releases/latest";

	const roles: { key: Role; icon: string; labelKey: string; descKey: string }[] = [
		{ key: "student", icon: "🎓", labelKey: "download.roleStudent", descKey: "download.roleStudentDesc" },
		{ key: "teacher", icon: "👩‍🏫", labelKey: "download.roleTeacher", descKey: "download.roleTeacherDesc" },
		{ key: "parent", icon: "👨‍👩‍👧", labelKey: "download.roleParent", descKey: "download.roleParentDesc" },
		{ key: "admin", icon: "🏫", labelKey: "download.roleAdmin", descKey: "download.roleAdminDesc" },
	];

	const platformInfo: Record<Platform, { name: string; icon: string }> = {
		macos: { name: "macOS", icon: "🍎" },
		windows: { name: "Windows", icon: "🪟" },
		linux: { name: "Linux", icon: "🐧" },
		android: { name: "Android", icon: "🤖" },
		ios: { name: "iOS", icon: "📱" },
		unknown: { name: "Your Device", icon: "💻" },
	};

	function detectPlatform(): Platform {
		if (typeof navigator === "undefined") return "unknown";
		const ua = navigator.userAgent.toLowerCase();
		const platform = (navigator as any).userAgentData?.platform?.toLowerCase() ?? "";
		if (/android/.test(ua)) return "android";
		if (/iphone|ipad|ipod/.test(ua)) return "ios";
		if (/macintosh|macos|mac os/.test(ua) || platform === "macos") return "macos";
		if (/win/.test(ua) || platform === "windows") return "windows";
		if (/linux/.test(ua)) return "linux";
		return "unknown";
	}

	let isMobile = $derived(detectedPlatform === "android" || detectedPlatform === "ios");
	let isDesktop = $derived(detectedPlatform === "macos" || detectedPlatform === "windows" || detectedPlatform === "linux");
	let showMobileApp = $derived(selectedRole !== "admin");
	let showDesktopApp = $derived(selectedRole === "admin");

	function getDownloadUrl(): string {
		if (showDesktopApp) {
			switch (detectedPlatform) {
				case "macos": return `${RELEASES_URL}/download/MeroSchool.dmg`;
				case "windows": return `${RELEASES_URL}/download/MeroSchool.msi`;
				case "linux": return `${RELEASES_URL}/download/MeroSchool.AppImage`;
				default: return RELEASES_URL;
			}
		}
		if (detectedPlatform === "android") return `${RELEASES_URL}/download/meroschool.apk`;
		if (detectedPlatform === "ios") return "#"; // App Store placeholder
		return RELEASES_URL;
	}

	function getDownloadLabel(): string {
		if (showDesktopApp) {
			const ext: Record<string, string> = { macos: ".dmg", windows: ".msi", linux: ".AppImage" };
			return `Download for ${platformInfo[detectedPlatform]?.name ?? "Desktop"} (${ext[detectedPlatform] ?? ""})`;
		}
		if (detectedPlatform === "android") return "Download APK for Android";
		if (detectedPlatform === "ios") return "Coming soon on App Store";
		return "Download";
	}

	const features: { icon: string; titleKey: string; descKey: string }[] = [
		{ icon: "⚡", titleKey: "download.featureFast", descKey: "download.featureFastDesc" },
		{ icon: "🔒", titleKey: "download.featureSecure", descKey: "download.featureSecureDesc" },
		{ icon: "📶", titleKey: "download.featureOffline", descKey: "download.featureOfflineDesc" },
		{ icon: "🔔", titleKey: "download.featureNotify", descKey: "download.featureNotifyDesc" },
	];

	onMount(() => {
		detectedPlatform = detectPlatform();
	});
</script>

<svelte:head>
	<title>{$t("download.pageTitle")} — MeroSchool</title>
	<meta name="description" content="Download MeroSchool for your device. Available on Android, iOS, macOS, Windows, and Linux." />
	<meta property="og:title" content="Download MeroSchool" />
	<meta property="og:description" content="Get the MeroSchool app for students, teachers, parents, and administrators." />
</svelte:head>

<!-- Hero -->
<section class="relative overflow-hidden">
	<div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
	<div class="absolute top-20 right-10 w-72 h-72 bg-primary/8 rounded-full blur-3xl"></div>
	<div class="absolute bottom-10 left-10 w-72 h-72 bg-accent/8 rounded-full blur-3xl"></div>

	<div class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
		<div class="text-center max-w-3xl mx-auto">
			<Badge variant="accent" class="mb-5">{$t("download.badge")}</Badge>
			<h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
				{$t("download.title")}
			</h1>
			<p class="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
				{$t("download.subtitle")}
			</p>
		</div>

		<!-- Role Selector -->
		<div class="mt-12 max-w-3xl mx-auto">
			<p class="text-center text-sm font-medium text-muted-foreground mb-4">{$t("download.selectRole")}</p>
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{#each roles as role}
					<button
						onclick={() => selectedRole = role.key}
						class="flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all cursor-pointer {selectedRole === role.key ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-muted-foreground/30 hover:bg-muted/50'}"
					>
						<span class="text-2xl">{role.icon}</span>
						<span class="text-sm font-semibold {selectedRole === role.key ? 'text-primary' : 'text-foreground'}">{$t(role.labelKey)}</span>
						<span class="text-[11px] text-muted-foreground text-center leading-tight">{$t(role.descKey)}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Download Card -->
		<div class="mt-10 max-w-2xl mx-auto">
			<Card class="p-8 text-center relative overflow-hidden">
				<div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>

				{#if showDesktopApp}
					<!-- Admin Desktop App -->
					<div class="mb-6">
						<div class="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-4">
							<svg class="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
							</svg>
						</div>
						<h2 class="text-2xl font-bold">{$t("download.desktopTitle")}</h2>
						<p class="mt-2 text-sm text-muted-foreground">{$t("download.desktopDesc")}</p>
					</div>

					<div class="flex items-center justify-center gap-2 mb-6">
						<Badge variant="secondary">{platformInfo[detectedPlatform]?.icon} {$t("download.detectedPlatform")}: {platformInfo[detectedPlatform]?.name}</Badge>
					</div>

					<a href={getDownloadUrl()} target="_blank" rel="noopener noreferrer">
						<Button size="lg" class="px-10 text-base">
							<svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
							{getDownloadLabel()}
						</Button>
					</a>

					<!-- Other platforms -->
					<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
						{#each (["macos", "windows", "linux"] as Platform[]).filter(p => p !== detectedPlatform) as p}
							<a href="{RELEASES_URL}" target="_blank" rel="noopener noreferrer" class="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline">
								{platformInfo[p].icon} {platformInfo[p].name}
							</a>
						{/each}
					</div>

				{:else}
					<!-- Mobile App for Students/Teachers/Parents -->
					<div class="mb-6">
						<div class="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 mb-4">
							<svg class="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
							</svg>
						</div>
						<h2 class="text-2xl font-bold">{$t("download.mobileTitle")}</h2>
						<p class="mt-2 text-sm text-muted-foreground">{$t("download.mobileDesc")}</p>
					</div>

					{#if detectedPlatform === "android" || detectedPlatform === "unknown" || isDesktop}
						<a href="{RELEASES_URL}/download/meroschool.apk" target="_blank" rel="noopener noreferrer">
							<Button size="lg" class="px-10 text-base">
								<svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
								{$t("download.androidApk")}
							</Button>
						</a>
					{/if}

					{#if detectedPlatform === "ios"}
						<Button size="lg" class="px-10 text-base" disabled>
							{$t("download.iosComingSoon")}
						</Button>
					{/if}

					<!-- Store badges -->
					<div class="mt-6 flex flex-wrap items-center justify-center gap-4">
						<button class="inline-flex items-center gap-3 rounded-xl bg-foreground/5 border px-5 py-2.5 text-sm hover:bg-foreground/10 transition-colors cursor-pointer">
							<svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302-2.593-2.302 2.593-2.302zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
							<div class="text-left"><div class="text-[10px] opacity-60">{$t("download.getItOn")}</div><div class="text-sm font-semibold -mt-0.5">Google Play</div></div>
						</button>
						<button class="inline-flex items-center gap-3 rounded-xl bg-foreground/5 border px-5 py-2.5 text-sm hover:bg-foreground/10 transition-colors cursor-pointer">
							<svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
							<div class="text-left"><div class="text-[10px] opacity-60">{$t("download.comingSoonTo")}</div><div class="text-sm font-semibold -mt-0.5">App Store</div></div>
						</button>
					</div>
				{/if}

				<!-- GitHub Releases link -->
				<div class="mt-6 pt-4 border-t">
					<a href={RELEASES_URL} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
						<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
						{$t("download.allReleases")}
					</a>
				</div>
			</Card>
		</div>
	</div>
</section>

<!-- App Features -->
<section class="py-16 sm:py-20 bg-muted/20">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<h2 class="text-2xl font-bold text-center mb-10">{$t("download.whyDownload")}</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
			{#each features as feat}
				<Card class="p-6 text-center hover:shadow-md transition-shadow">
					<div class="text-3xl mb-3">{feat.icon}</div>
					<h3 class="text-sm font-semibold mb-1">{$t(feat.titleKey)}</h3>
					<p class="text-xs text-muted-foreground">{$t(feat.descKey)}</p>
				</Card>
			{/each}
		</div>
	</div>
</section>

<!-- System Requirements -->
<section class="py-16 sm:py-20">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		<h2 class="text-2xl font-bold text-center mb-10">{$t("download.sysReq")}</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card class="p-6">
				<h3 class="font-semibold mb-3 flex items-center gap-2">
					<svg class="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
					{$t("download.mobileReq")}
				</h3>
				<ul class="text-sm text-muted-foreground space-y-1.5">
					<li>Android 8.0+ (API 26)</li>
					<li>iOS 15.0+</li>
					<li>50 MB {$t("download.storage")}</li>
					<li>{$t("download.cameraQr")}</li>
				</ul>
			</Card>
			<Card class="p-6">
				<h3 class="font-semibold mb-3 flex items-center gap-2">
					<svg class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" /></svg>
					{$t("download.desktopReq")}
				</h3>
				<ul class="text-sm text-muted-foreground space-y-1.5">
					<li>macOS 11+ (Big Sur)</li>
					<li>Windows 10+ (64-bit)</li>
					<li>Linux (Ubuntu 20.04+, Fedora 36+)</li>
					<li>100 MB {$t("download.storage")}</li>
				</ul>
			</Card>
		</div>
	</div>
</section>
