<script lang="ts">
	import { t } from "$lib/i18n/index.js";
	import { locale, setLocale, type Locale } from "$lib/i18n/index.js";
	import { theme, setTheme, type Theme } from "$lib/theme.js";
	import Button from "$lib/components/ui/button.svelte";
	import { page } from "$app/stores";

	let mobileOpen = $state(false);
	let bellOpen = $state(false);
	let unreadCount = $state(3);

	const sampleNotifications = $state([
		{ id: 1, text: 'New assignment submitted by Aarav Sharma', time: '5 min ago', read: false },
		{ id: 2, text: 'Test results published for Class 10-A', time: '1 hour ago', read: false },
		{ id: 3, text: 'Attendance reminder for today', time: '3 hours ago', read: false },
		{ id: 4, text: 'Parent meeting scheduled for Friday', time: '1 day ago', read: true },
	]);

	let isDashboard = $derived($page.url.pathname.startsWith('/dashboard'));

	function markAllRead() {
		for (const n of sampleNotifications) n.read = true;
		unreadCount = 0;
		bellOpen = false;
	}

	const navLinks = [
		{ key: "nav.features", href: "/features" },
		{ key: "nav.pricing", href: "/pricing" },
		{ key: "nav.demo", href: "/demo" },
		{ key: "nav.about", href: "/about" },
		{ key: "nav.contact", href: "/contact" },
	];

	function toggleLocale() {
		setLocale($locale === "en" ? "ne" : "en");
	}

	function cycleTheme() {
		const themes: Theme[] = ["light", "dark", "system"];
		const i = themes.indexOf($theme);
		setTheme(themes[(i + 1) % themes.length]);
	}

	const themeIcon: Record<Theme, string> = {
		light: "☀️",
		dark: "🌙",
		system: "💻",
	};
</script>

<nav class="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
	<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
		<!-- Logo -->
		<a href="/" class="flex items-center gap-2">
			<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">M</div>
			<span class="text-xl font-bold text-foreground">MeroSchool</span>
		</a>

		<!-- Desktop Nav -->
		<div class="hidden md:flex items-center gap-1">
			{#each navLinks as link}
				<a href={link.href} class="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
					{$t(link.key)}
				</a>
			{/each}
		</div>

		<!-- Right side -->
		<div class="hidden md:flex items-center gap-2">
			<button onclick={toggleLocale} class="px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted cursor-pointer">
				{$locale === "en" ? "नेपाली" : "English"}
			</button>
			<button onclick={cycleTheme} class="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted cursor-pointer" aria-label="Toggle theme">
				{themeIcon[$theme]}
			</button>
			{#if isDashboard}
				<div class="relative">
					<button onclick={() => bellOpen = !bellOpen} class="relative h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted cursor-pointer" aria-label="Notifications">
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
						</svg>
						{#if unreadCount > 0}
							<span class="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{unreadCount}</span>
						{/if}
					</button>
					{#if bellOpen}
						<div class="absolute right-0 mt-2 w-80 rounded-xl border bg-card shadow-lg z-50">
							<div class="flex items-center justify-between px-4 py-3 border-b">
								<span class="text-sm font-semibold text-foreground">{$t("notifications.title")}</span>
								<button onclick={markAllRead} class="text-xs text-primary hover:underline cursor-pointer">{$t("notifications.markAllRead")}</button>
							</div>
							<div class="max-h-64 overflow-y-auto">
								{#each sampleNotifications as notif}
									<div class="px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-b-0 {notif.read ? 'opacity-60' : ''}">
										<p class="text-sm text-foreground">{notif.text}</p>
										<span class="text-xs text-muted-foreground">{notif.time}</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}
			<a href="/onboard">
				<Button variant="default" size="sm">{$t("nav.onboard")}</Button>
			</a>
		</div>

		<!-- Mobile menu button -->
		<button onclick={() => mobileOpen = !mobileOpen} class="md:hidden h-9 w-9 flex items-center justify-center text-muted-foreground cursor-pointer" aria-label="Toggle menu">
			<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				{#if mobileOpen}
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				{:else}
					<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
				{/if}
			</svg>
		</button>
	</div>

	<!-- Mobile menu -->
	{#if mobileOpen}
		<div class="md:hidden border-t bg-background px-4 pb-4">
			{#each navLinks as link}
				<a href={link.href} class="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" onclick={() => mobileOpen = false}>
					{$t(link.key)}
				</a>
			{/each}
			<div class="flex items-center gap-2 mt-3 px-3">
				<button onclick={toggleLocale} class="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
					{$locale === "en" ? "नेपाली" : "English"}
				</button>
				<button onclick={cycleTheme} class="text-sm cursor-pointer">{themeIcon[$theme]}</button>
			</div>
			<div class="mt-3 px-3">
				<a href="/onboard">
					<Button variant="default" size="sm" class="w-full">{$t("nav.onboard")}</Button>
				</a>
			</div>
		</div>
	{/if}
</nav>
