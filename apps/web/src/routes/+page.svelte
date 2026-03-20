<script lang="ts">
	import { t } from "$lib/i18n/index.js";
	import Button from "$lib/components/ui/button.svelte";
	import Badge from "$lib/components/ui/badge.svelte";
	import Card from "$lib/components/ui/card.svelte";

	const features = [
		{ icon: "📋", key: "attendance", descKey: "attendanceDesc" },
		{ icon: "📚", key: "academics", descKey: "academicsDesc" },
		{ icon: "💰", key: "fees", descKey: "feesDesc" },
		{ icon: "💬", key: "communication", descKey: "communicationDesc" },
		{ icon: "📊", key: "reports", descKey: "reportsDesc" },
		{ icon: "📱", key: "mobile", descKey: "mobileDesc" },
	];

	const stats = [
		{ key: "hero.schools", value: "500+" },
		{ key: "hero.students", value: "100K+" },
		{ key: "hero.uptime", value: "99.9%" },
	];
</script>

<svelte:head>
	<title>MeroSchool — Nepal's #1 School Management Platform</title>
	<meta name="description" content="All-in-one digital platform for Nepali schools. Manage academics, attendance, fees, and communication. Connect students, teachers, parents, and administrators." />
	<meta property="og:title" content="MeroSchool — Nepal's #1 School Management Platform" />
	<meta property="og:description" content="All-in-one digital platform for Nepali schools. Manage academics, attendance, fees, and communication." />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		"name": "MeroSchool",
		"applicationCategory": "EducationalApplication",
		"operatingSystem": "Web, iOS, Android",
		"description": "All-in-one school management platform for Nepal",
		"offers": { "@type": "Offer", "price": "0", "priceCurrency": "NPR" }
	})}</script>`}
</svelte:head>

<!-- Hero Section -->
<section class="relative overflow-hidden">
	<!-- Background gradient -->
	<div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
	<div class="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
	<div class="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

	<div class="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
		<div class="text-center max-w-4xl mx-auto">
			<Badge variant="accent" class="mb-6">{$t("hero.badge")}</Badge>

			<h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
				<span class="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">{$t("hero.digitalSchool")}</span>
				<br />
				<span>{$t("hero.forNepal")}</span>
			</h1>

			<p class="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
				{$t("hero.subtitle")}
			</p>

			<div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
				<a href="/onboard">
					<Button size="lg">{$t("hero.cta")}</Button>
				</a>
				<a href="/demo">
					<Button variant="outline" size="lg">{$t("hero.ctaSecondary")}</Button>
				</a>
			</div>

			<!-- Stats -->
			<div class="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
				{#each stats as stat}
					<div class="text-center">
						<div class="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
						<div class="text-sm text-muted-foreground mt-1">{$t(stat.key)}</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Hero illustration: Dashboard preview -->
		<div class="mt-16 mx-auto max-w-5xl">
			<div class="rounded-2xl border bg-card shadow-2xl overflow-hidden">
				<div class="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
					<div class="w-3 h-3 rounded-full bg-red-400"></div>
					<div class="w-3 h-3 rounded-full bg-yellow-400"></div>
					<div class="w-3 h-3 rounded-full bg-green-400"></div>
					<span class="ml-2 text-xs text-muted-foreground">dashboard.meroschool.com</span>
				</div>
				<div class="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
					<div class="rounded-xl bg-primary/10 p-4 text-center">
						<div class="text-3xl font-bold text-primary">1,247</div>
						<div class="text-xs text-muted-foreground mt-1 font-medium">Students</div>
					</div>
					<div class="rounded-xl bg-accent/10 p-4 text-center">
						<div class="text-3xl font-bold text-accent">86</div>
						<div class="text-xs text-muted-foreground mt-1 font-medium">Teachers</div>
					</div>
					<div class="rounded-xl bg-chart-4/10 p-4 text-center">
						<div class="text-3xl font-bold text-chart-4">94.2%</div>
						<div class="text-xs text-muted-foreground mt-1 font-medium">Attendance</div>
					</div>
					<div class="rounded-xl bg-chart-1/10 p-4 text-center">
						<div class="text-3xl font-bold text-chart-1">Rs.12L</div>
						<div class="text-xs text-muted-foreground mt-1 font-medium">Fees Collected</div>
					</div>
				</div>
				<div class="px-6 pb-6 grid grid-cols-2 gap-4">
					<div class="rounded-lg bg-muted/50 p-4">
						<div class="text-xs font-medium text-muted-foreground mb-3">Monthly Attendance</div>
						<div class="flex gap-1 items-end h-20">
							{#each [40, 65, 55, 80, 70, 90, 75, 85, 60, 95, 80, 88] as h}
								<div class="flex-1 rounded-t bg-gradient-to-t from-primary/80 to-primary/40 transition-all" style="height: {h}%"></div>
							{/each}
						</div>
						<div class="flex justify-between mt-1">
							<span class="text-[9px] text-muted-foreground">Jan</span>
							<span class="text-[9px] text-muted-foreground">Dec</span>
						</div>
					</div>
					<div class="rounded-lg bg-muted/50 p-4">
						<div class="text-xs font-medium text-muted-foreground mb-3">Recent Activity</div>
						<div class="space-y-2">
							<div class="flex items-center gap-2">
								<div class="h-2 w-2 rounded-full bg-green-500"></div>
								<span class="text-[11px] text-foreground">Attendance marked - 10A</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="h-2 w-2 rounded-full bg-blue-500"></div>
								<span class="text-[11px] text-foreground">Test published - Science</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="h-2 w-2 rounded-full bg-purple-500"></div>
								<span class="text-[11px] text-foreground">Fee collected - Rs.5,000</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="h-2 w-2 rounded-full bg-orange-500"></div>
								<span class="text-[11px] text-foreground">Assignment graded - Math</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Features Overview -->
<section class="py-20 sm:py-28 bg-muted/20">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center max-w-2xl mx-auto mb-16">
			<h2 class="text-3xl font-bold sm:text-4xl">{$t("features.overviewTitle")}</h2>
			<p class="mt-4 text-muted-foreground text-lg">{$t("features.overviewSubtitle")}</p>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each features as feature}
				<Card class="p-6 hover:shadow-md transition-shadow">
					<div class="text-3xl mb-4">{feature.icon}</div>
					<h3 class="text-lg font-semibold mb-2">{$t(`features.${feature.key}`)}</h3>
					<p class="text-sm text-muted-foreground leading-relaxed">{$t(`features.${feature.descKey}`)}</p>
				</Card>
			{/each}
		</div>
	</div>
</section>

<!-- Built for Nepal -->
<section class="py-16 sm:py-20">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="rounded-2xl border bg-card p-8 sm:p-12">
			<div class="flex flex-col sm:flex-row items-center gap-8">
				<div class="text-6xl shrink-0">&#127475;&#127477;</div>
				<div>
					<h2 class="text-2xl font-bold text-foreground sm:text-3xl">{$t("nepal.title")}</h2>
					<div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
								<svg class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
							</div>
							<span class="text-sm text-foreground">{$t("nepal.nepaliSupport")}</span>
						</div>
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
								<svg class="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
							</div>
							<span class="text-sm text-foreground">{$t("nepal.surkhet")}</span>
						</div>
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
								<svg class="h-5 w-5 text-chart-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
							</div>
							<span class="text-sm text-foreground">{$t("nepal.offline")}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- CTA: Download App -->
<section class="py-20 sm:py-28">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 sm:p-12 text-center text-primary-foreground">
			<h2 class="text-3xl font-bold sm:text-4xl">{$t("hero.downloadApp")}</h2>
			<p class="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
				Stay connected with your school from anywhere. Available on iOS and Android.
			</p>
			<div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
				<button class="inline-flex items-center gap-3 rounded-xl bg-black/20 px-6 py-3 text-sm font-medium hover:bg-black/30 transition-colors cursor-pointer">
					<svg class="h-7 w-7" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
					<div class="text-left"><div class="text-[10px] opacity-80">Download on the</div><div class="text-base font-semibold -mt-0.5">App Store</div></div>
				</button>
				<button class="inline-flex items-center gap-3 rounded-xl bg-black/20 px-6 py-3 text-sm font-medium hover:bg-black/30 transition-colors cursor-pointer">
					<svg class="h-7 w-7" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302-2.593-2.302 2.593-2.302zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
					<div class="text-left"><div class="text-[10px] opacity-80">Get it on</div><div class="text-base font-semibold -mt-0.5">Google Play</div></div>
				</button>
			</div>
		</div>
	</div>
</section>

<!-- Trusted by -->
<section class="py-12 border-t">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
		<p class="text-sm text-muted-foreground mb-6">Trusted by schools across Nepal</p>
		<div class="flex flex-wrap items-center justify-center gap-8 opacity-50">
			{#each ["Budhanilkantha School", "Rato Bangala", "St. Xavier's", "Galaxy Public", "Sunrise Academy", "DAV School"] as school}
				<span class="text-sm font-medium text-muted-foreground">{school}</span>
			{/each}
		</div>
	</div>
</section>
