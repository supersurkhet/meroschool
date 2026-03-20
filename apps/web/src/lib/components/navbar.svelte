<script lang="ts">
	import { t } from "$lib/i18n/index.js";
	import { locale, setLocale, type Locale } from "$lib/i18n/index.js";
	import { theme, setTheme, type Theme } from "$lib/theme.js";
	import Button from "$lib/components/ui/button.svelte";

	let mobileOpen = $state(false);

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
