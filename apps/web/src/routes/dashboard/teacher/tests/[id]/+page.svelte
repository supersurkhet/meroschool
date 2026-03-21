<script lang="ts">
import Badge from '$lib/components/ui/badge.svelte'
import Button from '$lib/components/ui/button.svelte'
import Card from '$lib/components/ui/card.svelte'
import { t } from '$lib/i18n/index.js'

const { data } = $props()

interface StudentResult {
	name: string
	score: number
	total: number
	percentage: number
	timeTaken: string
}

const testTitle = 'Mid-term Mathematics'
const totalMarks = 100

const results: StudentResult[] = [
	{ name: 'Aarav Sharma', score: 92, total: totalMarks, percentage: 92, timeTaken: '45 min' },
	{ name: 'Bipana Thapa', score: 88, total: totalMarks, percentage: 88, timeTaken: '52 min' },
	{ name: 'Chandan Adhikari', score: 76, total: totalMarks, percentage: 76, timeTaken: '58 min' },
	{ name: 'Deepa Gurung', score: 95, total: totalMarks, percentage: 95, timeTaken: '40 min' },
	{ name: 'Eshan Karki', score: 62, total: totalMarks, percentage: 62, timeTaken: '55 min' },
	{ name: 'Fatima Khatun', score: 45, total: totalMarks, percentage: 45, timeTaken: '60 min' },
	{ name: 'Ganesh Poudel', score: 71, total: totalMarks, percentage: 71, timeTaken: '50 min' },
	{ name: 'Hira Tamang', score: 83, total: totalMarks, percentage: 83, timeTaken: '48 min' },
]

const avgScore = $derived(Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length))
const highestScore = $derived(Math.max(...results.map((r) => r.score)))
const lowestScore = $derived(Math.min(...results.map((r) => r.score)))
const passRate = $derived(
	Math.round((results.filter((r) => r.percentage >= 40).length / results.length) * 100),
)

const stats = $derived([
	{
		label: $t('results.avgScore'),
		value: `${avgScore}/${totalMarks}`,
		color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
	},
	{
		label: $t('results.highest'),
		value: `${highestScore}/${totalMarks}`,
		color: 'bg-green-500/10 text-green-600 dark:text-green-400',
	},
	{
		label: $t('results.lowest'),
		value: `${lowestScore}/${totalMarks}`,
		color: 'bg-red-500/10 text-red-600 dark:text-red-400',
	},
	{
		label: $t('results.passRate'),
		value: `${passRate}%`,
		color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
	},
])

function exportCSV() {
	const headers = ['Name', 'Score', 'Total', 'Percentage', 'Time Taken']
	const rows = results.map((r) => [r.name, r.score, r.total, `${r.percentage}%`, r.timeTaken])
	const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
	const blob = new Blob([csv], { type: 'text/csv' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = `test-results-${Date.now()}.csv`
	a.click()
	URL.revokeObjectURL(url)
}

function percentageColor(pct: number): string {
	if (pct >= 80) return 'text-green-600 dark:text-green-400'
	if (pct >= 60) return 'text-yellow-600 dark:text-yellow-400'
	return 'text-red-600 dark:text-red-400'
}
</script>

<svelte:head>
	<title>{$t('results.title')} | MeroSchool</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<a href="/dashboard/teacher/tests" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
				&larr; {$t('results.backToTests')}
			</a>
			<h1 class="text-2xl font-bold text-foreground mt-1">{testTitle} - {$t('results.title')}</h1>
		</div>
		<Button onclick={exportCSV} variant="outline" size="sm">{$t('results.exportCSV')}</Button>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		{#each stats as stat}
			<Card class="p-4">
				<div class="text-sm text-muted-foreground">{stat.label}</div>
				<div class="text-2xl font-bold mt-1 {stat.color}">{stat.value}</div>
			</Card>
		{/each}
	</div>

	<!-- Results Table -->
	<Card class="overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b bg-muted/50">
						<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">#</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{$t('results.studentName')}</th>
						<th class="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">{$t('results.score')}</th>
						<th class="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">{$t('results.percentage')}</th>
						<th class="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">{$t('results.timeTaken')}</th>
						<th class="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">{$t('results.statusLabel')}</th>
					</tr>
				</thead>
				<tbody>
					{#each results as result, i}
						<tr class="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
							<td class="px-4 py-3 text-sm text-muted-foreground">{i + 1}</td>
							<td class="px-4 py-3 text-sm font-medium text-foreground">{result.name}</td>
							<td class="px-4 py-3 text-sm text-center text-foreground">{result.score}/{result.total}</td>
							<td class="px-4 py-3 text-sm text-center font-medium {percentageColor(result.percentage)}">{result.percentage}%</td>
							<td class="px-4 py-3 text-sm text-center text-muted-foreground">{result.timeTaken}</td>
							<td class="px-4 py-3 text-center">
								<Badge variant={result.percentage >= 40 ? 'accent' : 'secondary'}>
									{result.percentage >= 40 ? $t('results.pass') : $t('results.fail')}
								</Badge>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Card>
</div>
