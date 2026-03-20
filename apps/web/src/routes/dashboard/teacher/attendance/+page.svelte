<script lang="ts">
	import { t } from '$lib/i18n/index.js'
	import Card from '$lib/components/ui/card.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import Badge from '$lib/components/ui/badge.svelte'
	import Select from '$lib/components/ui/select.svelte'
	import Input from '$lib/components/ui/input.svelte'

	type AttendanceStatus = 'present' | 'absent' | 'late'

	interface Student {
		id: string
		roll: number
		name: string
		status: AttendanceStatus
	}

	let { data } = $props()

	let selectedSection = $state('10-A')
	let selectedDate = $state(new Date().toISOString().split('T')[0])

	const sections = data.sections ?? ['10-A', '10-B', '9-A', '9-B', '8-A', '8-B']

	let students: Student[] = $state(data.students ?? [
		{ id: '1', roll: 1, name: 'Aarav Sharma', status: 'present' },
		{ id: '2', roll: 2, name: 'Bipana Thapa', status: 'present' },
		{ id: '3', roll: 3, name: 'Chandan Adhikari', status: 'present' },
		{ id: '4', roll: 4, name: 'Deepa Gurung', status: 'present' },
		{ id: '5', roll: 5, name: 'Eshan Karki', status: 'present' },
		{ id: '6', roll: 6, name: 'Fatima Khatun', status: 'present' },
		{ id: '7', roll: 7, name: 'Ganesh Poudel', status: 'present' },
		{ id: '8', roll: 8, name: 'Hira Tamang', status: 'present' },
		{ id: '9', roll: 9, name: 'Ishwor Bhandari', status: 'present' },
		{ id: '10', roll: 10, name: 'Janaki Rai', status: 'present' },
		{ id: '11', roll: 11, name: 'Krishna Magar', status: 'present' },
		{ id: '12', roll: 12, name: 'Laxmi Shrestha', status: 'present' },
	])

	let presentCount = $derived(students.filter((s) => s.status === 'present').length)
	let absentCount = $derived(students.filter((s) => s.status === 'absent').length)
	let lateCount = $derived(students.filter((s) => s.status === 'late').length)

	function setStatus(id: string, status: AttendanceStatus) {
		const idx = students.findIndex((s) => s.id === id)
		if (idx >= 0) students[idx].status = status
	}

	function markAllPresent() {
		students = students.map((s) => ({ ...s, status: 'present' as AttendanceStatus }))
	}

	let submitting = $state(false)
	let submitted = $state(false)

	function handleSubmit() {
		submitting = true
		setTimeout(() => {
			submitting = false
			submitted = true
			setTimeout(() => (submitted = false), 3000)
		}, 800)
	}
</script>

<svelte:head>
	<title>{$t('attendance.title')} | MeroSchool</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<h1 class="text-2xl font-bold text-foreground">{$t('attendance.title')}</h1>
		<Button onclick={markAllPresent} variant="outline" size="sm">{$t('attendance.markAllPresent')}</Button>
	</div>

	<!-- Filters -->
	<Card class="p-4">
		<div class="flex flex-col sm:flex-row gap-4">
			<div class="flex-1">
				<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('attendance.section')}</label>
				<Select bind:value={selectedSection}>
					{#each sections as section}
						<option value={section}>Class {section}</option>
					{/each}
				</Select>
			</div>
			<div class="flex-1">
				<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('attendance.date')}</label>
				<Input type="date" bind:value={selectedDate} />
			</div>
		</div>
	</Card>

	<!-- Student List -->
	<Card class="overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b bg-muted/50">
						<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{$t('attendance.roll')}</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{$t('attendance.studentName')}</th>
						<th class="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">{$t('attendance.status')}</th>
					</tr>
				</thead>
				<tbody>
					{#each students as student}
						<tr class="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
							<td class="px-4 py-3 text-sm text-foreground font-medium">{student.roll}</td>
							<td class="px-4 py-3 text-sm text-foreground">{student.name}</td>
							<td class="px-4 py-3">
								<div class="flex items-center justify-center gap-1.5">
									<button
										onclick={() => setStatus(student.id, 'present')}
										class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer {student.status === 'present' ? 'bg-green-500 text-white' : 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'}"
									>
										&#10003;
									</button>
									<button
										onclick={() => setStatus(student.id, 'absent')}
										class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer {student.status === 'absent' ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20'}"
									>
										&#10007;
									</button>
									<button
										onclick={() => setStatus(student.id, 'late')}
										class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer {student.status === 'late' ? 'bg-yellow-500 text-white' : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20'}"
									>
										&#9200;
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Card>

	<!-- Summary & Submit -->
	<Card class="p-4">
		<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
			<div class="flex items-center gap-4 text-sm">
				<span class="flex items-center gap-1.5">
					<span class="h-2.5 w-2.5 rounded-full bg-green-500"></span>
					<span class="text-foreground font-medium">{presentCount}</span>
					<span class="text-muted-foreground">{$t('attendance.present')}</span>
				</span>
				<span class="flex items-center gap-1.5">
					<span class="h-2.5 w-2.5 rounded-full bg-red-500"></span>
					<span class="text-foreground font-medium">{absentCount}</span>
					<span class="text-muted-foreground">{$t('attendance.absent')}</span>
				</span>
				<span class="flex items-center gap-1.5">
					<span class="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
					<span class="text-foreground font-medium">{lateCount}</span>
					<span class="text-muted-foreground">{$t('attendance.late')}</span>
				</span>
			</div>
			<div class="flex items-center gap-3">
				{#if submitted}
					<Badge variant="accent">{$t('attendance.saved')}</Badge>
				{/if}
				<Button onclick={handleSubmit} disabled={submitting}>
					{submitting ? $t('attendance.submitting') : $t('attendance.submit')}
				</Button>
			</div>
		</div>
	</Card>
</div>
