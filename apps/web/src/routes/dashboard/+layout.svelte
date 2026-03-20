<script lang="ts">
	import '$lib/../app.css'
	import { t } from '$lib/i18n/index.js'
	import { locale, setLocale, type Locale } from '$lib/i18n/index.js'
	import { theme, setTheme, type Theme } from '$lib/theme.js'
	import { applyTheme } from '$lib/theme.js'
	import { onMount } from 'svelte'
	import { user as userStore } from '$lib/stores/auth.svelte.js'
	import Button from '$lib/components/ui/button.svelte'

	let { data, children } = $props()

	onMount(() => {
		applyTheme($theme)
		const unsub = theme.subscribe((t) => applyTheme(t))

		if (data.user) {
			userStore.set(data.user)
		}

		return unsub
	})

	function toggleLocale() {
		setLocale($locale === 'en' ? 'ne' : 'en')
	}

	function cycleTheme() {
		const themes: Theme[] = ['light', 'dark', 'system']
		const i = themes.indexOf($theme)
		setTheme(themes[(i + 1) % themes.length])
	}

	const themeIcon: Record<Theme, string> = {
		light: '\u2600\uFE0F',
		dark: '\uD83C\uDF19',
		system: '\uD83D\uDCBB',
	}

	const sidebarLinks = [
		{ key: 'dashboard.nav.home', href: '/dashboard/teacher', icon: 'home' },
		{ key: 'dashboard.nav.attendance', href: '/dashboard/teacher/attendance', icon: 'clipboard' },
		{ key: 'dashboard.nav.tests', href: '/dashboard/teacher/tests', icon: 'pencil' },
		{ key: 'dashboard.nav.materials', href: '/dashboard/teacher/materials', icon: 'upload' },
		{ key: 'dashboard.nav.assignments', href: '/dashboard/teacher/assignments', icon: 'file' },
	]

	let sidebarOpen = $state(false)
	let bellOpen = $state(false)
	let unreadCount = $state(3)

	const sampleNotifications = $state([
		{ id: 1, text: 'New assignment submitted by Aarav Sharma', time: '5 min ago', read: false },
		{ id: 2, text: 'Test results published for Class 10-A', time: '1 hour ago', read: false },
		{ id: 3, text: 'Attendance reminder for today', time: '3 hours ago', read: false },
		{ id: 4, text: 'Parent meeting scheduled for Friday', time: '1 day ago', read: true },
	])

	function markAllRead() {
		for (const n of sampleNotifications) n.read = true
		unreadCount = 0
		bellOpen = false
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
</svelte:head>

<div class="flex min-h-screen bg-background">
	<!-- Sidebar (desktop) -->
	<aside class="hidden lg:flex w-64 flex-col border-r bg-card">
		<div class="flex h-16 items-center gap-2 border-b px-6">
			<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">M</div>
			<span class="text-xl font-bold text-foreground">MeroSchool</span>
		</div>
		<nav class="flex-1 space-y-1 p-4">
			{#each sidebarLinks as link}
				<a
					href={link.href}
					class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
				>
					{$t(link.key)}
				</a>
			{/each}
		</nav>
		<div class="border-t p-4">
			<a href="/auth/logout" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
				{$t('dashboard.nav.logout')}
			</a>
		</div>
	</aside>

	<!-- Mobile sidebar overlay -->
	{#if sidebarOpen}
		<div class="fixed inset-0 z-40 lg:hidden">
			<button class="absolute inset-0 bg-black/50" onclick={() => sidebarOpen = false} aria-label="Close sidebar"></button>
			<aside class="relative w-64 h-full flex flex-col bg-card border-r">
				<div class="flex h-16 items-center gap-2 border-b px-6">
					<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">M</div>
					<span class="text-xl font-bold text-foreground">MeroSchool</span>
				</div>
				<nav class="flex-1 space-y-1 p-4">
					{#each sidebarLinks as link}
						<a
							href={link.href}
							class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
							onclick={() => sidebarOpen = false}
						>
							{$t(link.key)}
						</a>
					{/each}
				</nav>
				<div class="border-t p-4">
					<a href="/auth/logout" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
						{$t('dashboard.nav.logout')}
					</a>
				</div>
			</aside>
		</div>
	{/if}

	<!-- Main content -->
	<div class="flex flex-1 flex-col">
		<!-- Top bar -->
		<header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-lg px-4 sm:px-6">
			<button class="lg:hidden h-9 w-9 flex items-center justify-center text-muted-foreground cursor-pointer" onclick={() => sidebarOpen = !sidebarOpen} aria-label="Toggle sidebar">
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>
			<div class="flex-1"></div>
			<div class="flex items-center gap-2">
				<button onclick={toggleLocale} class="px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted cursor-pointer">
					{$locale === 'en' ? 'नेपाली' : 'English'}
				</button>
				<button onclick={cycleTheme} class="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted cursor-pointer" aria-label="Toggle theme">
					{themeIcon[$theme]}
				</button>
				<!-- Notification Bell -->
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
								<span class="text-sm font-semibold text-foreground">{$t('notifications.title')}</span>
								<button onclick={markAllRead} class="text-xs text-primary hover:underline cursor-pointer">{$t('notifications.markAllRead')}</button>
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
				{#if data.user}
					<span class="text-sm font-medium text-foreground hidden sm:inline">{data.user.name}</span>
				{/if}
			</div>
		</header>

		<!-- Page content -->
		<main class="flex-1 p-4 sm:p-6 lg:p-8">
			{@render children()}
		</main>
	</div>
</div>
