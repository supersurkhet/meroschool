<script lang="ts">
	import { t } from '$lib/i18n/index.js'
	import Card from '$lib/components/ui/card.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import Badge from '$lib/components/ui/badge.svelte'
	import Input from '$lib/components/ui/input.svelte'
	import Select from '$lib/components/ui/select.svelte'
	import Textarea from '$lib/components/ui/textarea.svelte'

	let { data } = $props()

	interface Question {
		id: number
		text: string
		options: string[]
		correctIndex: number
		marks: number
	}

	interface Test {
		id: string
		title: string
		subject: string
		questionsCount: number
		status: 'published' | 'draft'
		date: string
		totalMarks: number
	}

	// Create test form state
	let testTitle = $state('')
	let testSubject = $state('Mathematics')
	let testDuration = $state(60)

	// Question builder state
	let questionText = $state('')
	let options = $state(['', '', '', ''])
	let correctAnswer = $state(0)
	let questionMarks = $state(5)
	let questions: Question[] = $state([])
	let nextId = $state(1)

	// Auto-compute total marks from individual question marks
	let testTotalMarks = $derived(questions.reduce((sum, q) => sum + q.marks, 0))
	let editingId: number | null = $state(null)

	const subjects = ['Mathematics', 'Science', 'English', 'Nepali', 'Social Studies', 'Computer']

	function addQuestion() {
		if (!questionText.trim() || options.some((o) => !o.trim())) return

		if (editingId !== null) {
			const idx = questions.findIndex((q) => q.id === editingId)
			if (idx >= 0) {
				questions[idx] = {
					id: editingId,
					text: questionText,
					options: [...options],
					correctIndex: correctAnswer,
					marks: questionMarks,
				}
			}
			editingId = null
		} else {
			questions = [
				...questions,
				{
					id: nextId++,
					text: questionText,
					options: [...options],
					correctIndex: correctAnswer,
					marks: questionMarks,
				},
			]
		}
		resetQuestionForm()
	}

	function editQuestion(q: Question) {
		editingId = q.id
		questionText = q.text
		options = [...q.options]
		correctAnswer = q.correctIndex
		questionMarks = q.marks
	}

	function removeQuestion(id: number) {
		questions = questions.filter((q) => q.id !== id)
	}

	function resetQuestionForm() {
		questionText = ''
		options = ['', '', '', '']
		correctAnswer = 0
		questionMarks = 5
	}

	// Existing tests (from server, with fallback)
	let existingTests: Test[] = $state(data.tests ?? [
		{ id: 'test-1', title: 'Mid-term Mathematics', subject: 'Mathematics', questionsCount: 25, status: 'published', date: '2026-03-15', totalMarks: 100 },
		{ id: 'test-2', title: 'Science Unit Test', subject: 'Science', questionsCount: 15, status: 'published', date: '2026-03-10', totalMarks: 50 },
		{ id: 'test-3', title: 'English Grammar Quiz', subject: 'English', questionsCount: 10, status: 'draft', date: '2026-03-18', totalMarks: 30 },
	])

	function handlePublish() {
		if (!testTitle.trim() || questions.length === 0) return
		existingTests = [
			{
				id: `test-${Date.now()}`,
				title: testTitle,
				subject: testSubject,
				questionsCount: questions.length,
				status: 'published',
				date: new Date().toISOString().split('T')[0],
				totalMarks: testTotalMarks,
			},
			...existingTests,
		]
		testTitle = ''
		testDuration = 60
		questions = []
	}
</script>

<svelte:head>
	<title>{$t('tests.title')} | MeroSchool</title>
</svelte:head>

<div class="space-y-8">
	<h1 class="text-2xl font-bold text-foreground">{$t('tests.title')}</h1>

	<!-- Create Test Form -->
	<Card class="p-6">
		<h2 class="text-lg font-semibold text-foreground mb-4">{$t('tests.createTest')}</h2>
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
			<div>
				<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('tests.testTitle')}</label>
				<Input bind:value={testTitle} placeholder={$t('tests.testTitlePlaceholder')} />
			</div>
			<div>
				<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('tests.subject')}</label>
				<Select bind:value={testSubject}>
					{#each subjects as subject}
						<option value={subject}>{subject}</option>
					{/each}
				</Select>
			</div>
			<div>
				<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('tests.duration')}</label>
				<Input type="number" bind:value={testDuration} min="5" max="180" />
			</div>
		</div>
		{#if questions.length > 0}
			<p class="text-sm text-muted-foreground mb-6">{$t('tests.totalMarks')}: <span class="font-semibold text-foreground">{testTotalMarks}</span></p>
		{/if}

		<!-- Question Builder -->
		<div class="border-t pt-6">
			<h3 class="text-md font-semibold text-foreground mb-4">{$t('tests.questionBuilder')}</h3>
			<div class="space-y-4">
				<div>
					<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('tests.questionText')}</label>
					<Textarea bind:value={questionText} placeholder={$t('tests.questionPlaceholder')} rows={2} />
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{#each options as _, i}
						<div class="flex items-center gap-2">
							<input
								type="radio"
								name="correct"
								checked={correctAnswer === i}
								onchange={() => (correctAnswer = i)}
								class="h-4 w-4 accent-primary cursor-pointer"
							/>
							<span class="text-sm font-medium text-muted-foreground w-6">{String.fromCharCode(65 + i)}.</span>
							<Input bind:value={options[i]} placeholder={`${$t('tests.option')} ${String.fromCharCode(65 + i)}`} class="flex-1" />
						</div>
					{/each}
				</div>
				<div class="flex items-end gap-4">
					<div class="w-32">
						<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('tests.marks')}</label>
						<Input type="number" bind:value={questionMarks} min="1" />
					</div>
					<Button onclick={addQuestion} variant={editingId !== null ? 'accent' : 'default'} size="sm">
						{editingId !== null ? $t('tests.updateQuestion') : $t('tests.addQuestion')}
					</Button>
					{#if editingId !== null}
						<Button onclick={() => { editingId = null; resetQuestionForm() }} variant="ghost" size="sm">{$t('tests.cancel')}</Button>
					{/if}
				</div>
			</div>
		</div>

		<!-- Questions List -->
		{#if questions.length > 0}
			<div class="border-t pt-6 mt-6">
				<h3 class="text-md font-semibold text-foreground mb-3">{$t('tests.addedQuestions')} ({questions.length})</h3>
				<div class="space-y-3">
					{#each questions as q, i}
						<div class="flex items-start justify-between gap-4 rounded-lg border p-3 bg-muted/30">
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-foreground">{i + 1}. {q.text}</p>
								<div class="mt-1 flex flex-wrap gap-2">
									{#each q.options as opt, oi}
										<span class="text-xs px-2 py-0.5 rounded {oi === q.correctIndex ? 'bg-green-500/20 text-green-700 dark:text-green-400 font-medium' : 'text-muted-foreground'}">
											{String.fromCharCode(65 + oi)}. {opt}
										</span>
									{/each}
								</div>
								<span class="text-xs text-muted-foreground mt-1 block">{q.marks} {$t('tests.marks')}</span>
							</div>
							<div class="flex gap-1 shrink-0">
								<Button variant="ghost" size="sm" onclick={() => editQuestion(q)}>{$t('tests.edit')}</Button>
								<Button variant="ghost" size="sm" onclick={() => removeQuestion(q.id)}>{$t('tests.remove')}</Button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<div class="border-t pt-4 mt-6 flex justify-end">
			<Button onclick={handlePublish} disabled={!testTitle.trim() || questions.length === 0}>{$t('tests.publish')}</Button>
		</div>
	</Card>

	<!-- Existing Tests -->
	<div>
		<h2 class="text-lg font-semibold text-foreground mb-4">{$t('tests.myTests')}</h2>
		<Card class="overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b bg-muted/50">
							<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{$t('tests.testTitle')}</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{$t('tests.subject')}</th>
							<th class="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">{$t('tests.questions')}</th>
							<th class="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">{$t('tests.statusLabel')}</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{$t('tests.date')}</th>
							<th class="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">{$t('tests.actions')}</th>
						</tr>
					</thead>
					<tbody>
						{#each existingTests as test}
							<tr class="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
								<td class="px-4 py-3 text-sm font-medium text-foreground">{test.title}</td>
								<td class="px-4 py-3 text-sm text-muted-foreground">{test.subject}</td>
								<td class="px-4 py-3 text-sm text-center text-foreground">{test.questionsCount}</td>
								<td class="px-4 py-3 text-center">
									<Badge variant={test.status === 'published' ? 'accent' : 'secondary'}>
										{test.status === 'published' ? $t('tests.published') : $t('tests.draft')}
									</Badge>
								</td>
								<td class="px-4 py-3 text-sm text-muted-foreground">{test.date}</td>
								<td class="px-4 py-3 text-center">
									<a href="/dashboard/teacher/tests/{test.id}">
										<Button variant="ghost" size="sm">{$t('tests.viewResults')}</Button>
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card>
	</div>
</div>
