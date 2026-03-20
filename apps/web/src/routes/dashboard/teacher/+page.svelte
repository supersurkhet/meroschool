<script lang="ts">
	import { t } from '$lib/i18n/index.js'
	import Card from '$lib/components/ui/card.svelte'
	import Badge from '$lib/components/ui/badge.svelte'
	import Button from '$lib/components/ui/button.svelte'

	let { data } = $props()

	const today = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})

	const quickActions = [
		{
			key: 'teacher.action.attendance',
			href: '/dashboard/teacher/attendance',
			icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
			color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
		},
		{
			key: 'teacher.action.test',
			href: '/dashboard/teacher/tests',
			icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
			color: 'bg-green-500/10 text-green-600 dark:text-green-400',
		},
		{
			key: 'teacher.action.material',
			href: '/dashboard/teacher/materials',
			icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
			color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
		},
		{
			key: 'teacher.action.assignment',
			href: '/dashboard/teacher/assignments',
			icon: 'M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
			color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
		},
	]

	const classes = data.classes ?? []
</script>

<div class="space-y-8">
	<!-- Welcome Card -->
	<Card class="p-6">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
			<div>
				<h1 class="text-2xl font-bold text-foreground">
					{$t('teacher.welcome')}, {data.user?.name ?? $t('teacher.defaultName')}
				</h1>
				<p class="text-muted-foreground mt-1">{today}</p>
			</div>
			<Badge variant="accent">{$t('teacher.role')}</Badge>
		</div>
	</Card>

	<!-- Quick Actions -->
	<div>
		<h2 class="text-lg font-semibold text-foreground mb-4">{$t('teacher.quickActions')}</h2>
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
			{#each quickActions as action}
				<a href={action.href} class="group">
					<Card class="p-5 hover:shadow-md transition-shadow cursor-pointer">
						<div class="flex flex-col items-center gap-3 text-center">
							<div class="flex h-12 w-12 items-center justify-center rounded-xl {action.color}">
								<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
									<path stroke-linecap="round" stroke-linejoin="round" d={action.icon} />
								</svg>
							</div>
							<span class="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
								{$t(action.key)}
							</span>
						</div>
					</Card>
				</a>
			{/each}
		</div>
	</div>

	<!-- My Classes -->
	<div>
		<h2 class="text-lg font-semibold text-foreground mb-4">{$t('teacher.myClasses')}</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each classes as cls}
				<Card class="p-5">
					<div class="flex items-start justify-between">
						<div>
							<h3 class="font-semibold text-foreground">{cls.subject}</h3>
							<p class="text-sm text-muted-foreground mt-1">{cls.section}</p>
						</div>
						<Badge variant="secondary">{cls.students} {$t('teacher.students')}</Badge>
					</div>
					<div class="mt-4 flex gap-2">
						<Button variant="outline" size="sm">{$t('teacher.viewClass')}</Button>
						<Button variant="ghost" size="sm">{$t('teacher.action.attendance')}</Button>
					</div>
				</Card>
			{/each}
		</div>
	</div>
</div>
