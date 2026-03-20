<script lang="ts">
	import { t } from '$lib/i18n/index.js'
	import Card from '$lib/components/ui/card.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import Badge from '$lib/components/ui/badge.svelte'
	import Input from '$lib/components/ui/input.svelte'
	import Select from '$lib/components/ui/select.svelte'
	import Textarea from '$lib/components/ui/textarea.svelte'

	interface Submission {
		studentName: string
		submittedDate: string
		grade: number | null
		feedback: string
	}

	interface Assignment {
		id: string
		title: string
		description: string
		subject: string
		section: string
		dueDate: string
		totalMarks: number
		status: 'active' | 'closed'
		submissions: Submission[]
	}

	let assignTitle = $state('')
	let assignDescription = $state('')
	let assignSubject = $state('Mathematics')
	let assignSection = $state('10-A')
	let assignDueDate = $state('')
	let assignTotalMarks = $state(50)

	const subjects = ['Mathematics', 'Science', 'English', 'Nepali', 'Social Studies', 'Computer']
	const sections = ['10-A', '10-B', '9-A', '9-B', '8-A', '8-B']

	let assignments: Assignment[] = $state([
		{
			id: 'a1',
			title: 'Algebra Homework Ch. 5',
			description: 'Complete exercises 1-20 from chapter 5',
			subject: 'Mathematics',
			section: '10-A',
			dueDate: '2026-03-25',
			totalMarks: 50,
			status: 'active',
			submissions: [
				{ studentName: 'Aarav Sharma', submittedDate: '2026-03-20', grade: null, feedback: '' },
				{ studentName: 'Bipana Thapa', submittedDate: '2026-03-19', grade: 42, feedback: 'Good work' },
				{ studentName: 'Deepa Gurung', submittedDate: '2026-03-21', grade: null, feedback: '' },
			],
		},
		{
			id: 'a2',
			title: 'Science Lab Report',
			description: 'Write a detailed lab report on the photosynthesis experiment',
			subject: 'Science',
			section: '9-A',
			dueDate: '2026-03-22',
			totalMarks: 30,
			status: 'closed',
			submissions: [
				{ studentName: 'Eshan Karki', submittedDate: '2026-03-20', grade: 25, feedback: 'Well structured report' },
				{ studentName: 'Fatima Khatun', submittedDate: '2026-03-21', grade: 28, feedback: 'Excellent observations' },
			],
		},
	])

	let expandedId: string | null = $state(null)

	function toggleExpand(id: string) {
		expandedId = expandedId === id ? null : id
	}

	function createAssignment() {
		if (!assignTitle.trim() || !assignDueDate) return
		assignments = [
			{
				id: `a-${Date.now()}`,
				title: assignTitle,
				description: assignDescription,
				subject: assignSubject,
				section: assignSection,
				dueDate: assignDueDate,
				totalMarks: assignTotalMarks,
				status: 'active',
				submissions: [],
			},
			...assignments,
		]
		assignTitle = ''
		assignDescription = ''
		assignDueDate = ''
		assignTotalMarks = 50
	}

	function saveGrade(assignmentId: string, submissionIdx: number, grade: number | null, feedback: string) {
		const aIdx = assignments.findIndex((a) => a.id === assignmentId)
		if (aIdx >= 0) {
			assignments[aIdx].submissions[submissionIdx].grade = grade
			assignments[aIdx].submissions[submissionIdx].feedback = feedback
		}
	}
</script>

<svelte:head>
	<title>{$t('assignments.title')} | MeroSchool</title>
</svelte:head>

<div class="space-y-8">
	<h1 class="text-2xl font-bold text-foreground">{$t('assignments.title')}</h1>

	<!-- Create Assignment -->
	<Card class="p-6">
		<h2 class="text-lg font-semibold text-foreground mb-4">{$t('assignments.create')}</h2>
		<div class="space-y-4">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('assignments.assignTitle')}</label>
					<Input bind:value={assignTitle} placeholder={$t('assignments.titlePlaceholder')} />
				</div>
				<div>
					<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('assignments.subject')}</label>
					<Select bind:value={assignSubject}>
						{#each subjects as subject}
							<option value={subject}>{subject}</option>
						{/each}
					</Select>
				</div>
			</div>
			<div>
				<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('assignments.description')}</label>
				<Textarea bind:value={assignDescription} placeholder={$t('assignments.descriptionPlaceholder')} rows={3} />
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div>
					<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('assignments.section')}</label>
					<Select bind:value={assignSection}>
						{#each sections as section}
							<option value={section}>Class {section}</option>
						{/each}
					</Select>
				</div>
				<div>
					<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('assignments.dueDate')}</label>
					<Input type="date" bind:value={assignDueDate} />
				</div>
				<div>
					<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('assignments.totalMarks')}</label>
					<Input type="number" bind:value={assignTotalMarks} min="1" />
				</div>
			</div>
			<div class="flex justify-end">
				<Button onclick={createAssignment} disabled={!assignTitle.trim() || !assignDueDate}>{$t('assignments.createBtn')}</Button>
			</div>
		</div>
	</Card>

	<!-- Assignments List -->
	<div>
		<h2 class="text-lg font-semibold text-foreground mb-4">{$t('assignments.myAssignments')}</h2>
		<div class="space-y-4">
			{#each assignments as assignment}
				<Card class="overflow-hidden">
					<button
						onclick={() => toggleExpand(assignment.id)}
						class="w-full p-4 text-left hover:bg-muted/30 transition-colors cursor-pointer"
					>
						<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 flex-wrap">
									<h3 class="text-sm font-semibold text-foreground">{assignment.title}</h3>
									<Badge variant={assignment.status === 'active' ? 'accent' : 'secondary'}>
										{assignment.status === 'active' ? $t('assignments.active') : $t('assignments.closed')}
									</Badge>
								</div>
								<div class="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
									<span>{assignment.subject}</span>
									<span>Class {assignment.section}</span>
									<span>{$t('assignments.due')}: {assignment.dueDate}</span>
								</div>
							</div>
							<div class="flex items-center gap-3 shrink-0">
								<Badge variant="outline">{assignment.submissions.length} {$t('assignments.submissions')}</Badge>
								<svg class="h-4 w-4 text-muted-foreground transition-transform {expandedId === assignment.id ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
								</svg>
							</div>
						</div>
					</button>

					{#if expandedId === assignment.id}
						<div class="border-t px-4 pb-4">
							{#if assignment.description}
								<p class="text-sm text-muted-foreground mt-3 mb-4">{assignment.description}</p>
							{/if}
							{#if assignment.submissions.length === 0}
								<p class="text-sm text-muted-foreground py-4 text-center">{$t('assignments.noSubmissions')}</p>
							{:else}
								<div class="overflow-x-auto">
									<table class="w-full">
										<thead>
											<tr class="border-b">
												<th class="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">{$t('assignments.studentName')}</th>
												<th class="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">{$t('assignments.submitted')}</th>
												<th class="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">{$t('assignments.grade')} (/{assignment.totalMarks})</th>
												<th class="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">{$t('assignments.feedback')}</th>
												<th class="px-3 py-2 text-center text-xs font-medium text-muted-foreground uppercase">{$t('assignments.action')}</th>
											</tr>
										</thead>
										<tbody>
											{#each assignment.submissions as sub, si}
												<tr class="border-b last:border-b-0">
													<td class="px-3 py-2 text-sm text-foreground">{sub.studentName}</td>
													<td class="px-3 py-2 text-sm text-muted-foreground">{sub.submittedDate}</td>
													<td class="px-3 py-2">
														<Input
															type="number"
															value={sub.grade ?? ''}
															oninput={(e) => {
																const val = (e.target as HTMLInputElement).value
																assignment.submissions[si].grade = val ? Number(val) : null
															}}
															min="0"
															max={assignment.totalMarks}
															class="w-20"
														/>
													</td>
													<td class="px-3 py-2">
														<Input
															value={sub.feedback}
															oninput={(e) => {
																assignment.submissions[si].feedback = (e.target as HTMLInputElement).value
															}}
															placeholder={$t('assignments.feedbackPlaceholder')}
															class="w-40"
														/>
													</td>
													<td class="px-3 py-2 text-center">
														<Button
															variant="ghost"
															size="sm"
															onclick={() => saveGrade(assignment.id, si, assignment.submissions[si].grade, assignment.submissions[si].feedback)}
														>
															{$t('assignments.saveGrade')}
														</Button>
													</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							{/if}
						</div>
					{/if}
				</Card>
			{/each}
		</div>
	</div>
</div>
