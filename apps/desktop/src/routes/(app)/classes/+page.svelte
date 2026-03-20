<script lang="ts">
	import { t } from '$lib/i18n/index.svelte'
	import { Button } from '$lib/components/ui/button'
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label'
	import { Badge } from '$lib/components/ui/badge'
	import {
		Plus,
		Pencil,
		Trash2,
		X,
		Layers,
		ChevronDown,
		ChevronRight,
		Users,
	} from 'lucide-svelte'

	// ── Types ──────────────────────────────────────────────────────────
	interface Section {
		id: string
		name: string
		capacity: number
		studentCount: number
	}

	interface ClassRecord {
		id: string
		name: string
		school: string
		sections: Section[]
	}

	// ── State ──────────────────────────────────────────────────────────
	let classes = $state<ClassRecord[]>([
		{
			id: '1',
			name: 'Grade 1',
			school: 'Surkhet Valley Secondary School',
			sections: [
				{ id: '1a', name: 'Section A', capacity: 40, studentCount: 35 },
				{ id: '1b', name: 'Section B', capacity: 40, studentCount: 38 },
			],
		},
		{
			id: '2',
			name: 'Grade 2',
			school: 'Surkhet Valley Secondary School',
			sections: [
				{ id: '2a', name: 'Section A', capacity: 40, studentCount: 32 },
			],
		},
		{
			id: '3',
			name: 'Grade 3',
			school: 'Surkhet Valley Secondary School',
			sections: [
				{ id: '3a', name: 'Section A', capacity: 45, studentCount: 40 },
				{ id: '3b', name: 'Section B', capacity: 45, studentCount: 42 },
				{ id: '3c', name: 'Section C', capacity: 45, studentCount: 38 },
			],
		},
		{
			id: '4',
			name: 'Grade 4',
			school: 'Karnali Academy',
			sections: [
				{ id: '4a', name: 'Section A', capacity: 35, studentCount: 30 },
			],
		},
		{
			id: '5',
			name: 'Grade 5',
			school: 'Karnali Academy',
			sections: [],
		},
	])

	let expandedIds = $state<Set<string>>(new Set(['1', '3']))
	let showClassForm = $state(false)
	let addingSectionForClassId = $state<string | null>(null)
	let editingClassId = $state<string | null>(null)

	// Class form fields
	let className = $state('')
	let classSchool = $state('')

	// Section form fields
	let sectionName = $state('')
	let sectionCapacity = $state(40)

	// ── Computed ───────────────────────────────────────────────────────
	let totalStudents = $derived(
		classes.reduce(
			(sum, c) => sum + c.sections.reduce((s, sec) => s + sec.studentCount, 0),
			0,
		),
	)

	let totalSections = $derived(
		classes.reduce((sum, c) => sum + c.sections.length, 0),
	)

	// ── Class helpers ─────────────────────────────────────────────────
	function toggleExpand(id: string) {
		const next = new Set(expandedIds)
		if (next.has(id)) {
			next.delete(id)
		} else {
			next.add(id)
		}
		expandedIds = next
	}

	function resetClassForm() {
		className = ''
		classSchool = ''
		editingClassId = null
		showClassForm = false
	}

	function openAddClass() {
		resetClassForm()
		showClassForm = true
	}

	function openEditClass(cls: ClassRecord) {
		className = cls.name
		classSchool = cls.school
		editingClassId = cls.id
		showClassForm = true
	}

	function handleClassSubmit(e: SubmitEvent) {
		e.preventDefault()
		if (editingClassId) {
			classes = classes.map((c) =>
				c.id === editingClassId
					? { ...c, name: className, school: classSchool }
					: c,
			)
		} else {
			classes = [
				...classes,
				{
					id: crypto.randomUUID(),
					name: className,
					school: classSchool,
					sections: [],
				},
			]
		}
		resetClassForm()
	}

	function deleteClass(id: string) {
		classes = classes.filter((c) => c.id !== id)
	}

	// ── Section helpers ───────────────────────────────────────────────
	function openAddSection(classId: string) {
		sectionName = ''
		sectionCapacity = 40
		addingSectionForClassId = classId
		// Make sure class is expanded
		const next = new Set(expandedIds)
		next.add(classId)
		expandedIds = next
	}

	function cancelAddSection() {
		addingSectionForClassId = null
		sectionName = ''
		sectionCapacity = 40
	}

	function handleSectionSubmit(e: SubmitEvent, classId: string) {
		e.preventDefault()
		classes = classes.map((c) => {
			if (c.id !== classId) return c
			return {
				...c,
				sections: [
					...c.sections,
					{
						id: crypto.randomUUID(),
						name: sectionName,
						capacity: sectionCapacity,
						studentCount: 0,
					},
				],
			}
		})
		cancelAddSection()
	}

	function deleteSection(classId: string, sectionId: string) {
		classes = classes.map((c) => {
			if (c.id !== classId) return c
			return {
				...c,
				sections: c.sections.filter((s) => s.id !== sectionId),
			}
		})
	}
</script>

<div class="flex flex-col gap-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">{t('nav.classesSections')}</h1>
			<p class="text-sm text-muted-foreground">Manage classes and their sections</p>
		</div>
		<Button onclick={openAddClass} class="gap-2">
			<Plus class="h-4 w-4" />
			Add Class
		</Button>
	</div>

	<!-- Summary badges -->
	<div class="flex gap-3">
		<Badge variant="secondary" class="gap-1.5 px-3 py-1">
			<Layers class="h-3.5 w-3.5" />
			{classes.length} Classes
		</Badge>
		<Badge variant="secondary" class="gap-1.5 px-3 py-1">
			<Users class="h-3.5 w-3.5" />
			{totalSections} Sections
		</Badge>
		<Badge variant="outline" class="gap-1.5 px-3 py-1">
			{totalStudents} Students
		</Badge>
	</div>

	<!-- Add / Edit Class Form -->
	{#if showClassForm}
		<Card class="border-primary/30">
			<CardHeader class="pb-4">
				<div class="flex items-center justify-between">
					<CardTitle class="text-base">
						{editingClassId ? 'Edit Class' : 'Add New Class'}
					</CardTitle>
					<button
						onclick={resetClassForm}
						class="rounded-md p-1 text-muted-foreground hover:bg-muted"
					>
						<X class="h-4 w-4" />
					</button>
				</div>
			</CardHeader>
			<CardContent>
				<form onsubmit={handleClassSubmit} class="flex items-end gap-4">
					<div class="flex-1 space-y-1.5">
						<Label class="text-xs font-medium">Class Name</Label>
						<Input
							placeholder="e.g. Grade 6"
							bind:value={className}
							required
						/>
					</div>
					<div class="flex-1 space-y-1.5">
						<Label class="text-xs font-medium">School</Label>
						<Input
							placeholder="School name"
							bind:value={classSchool}
							required
						/>
					</div>
					<div class="flex gap-2">
						<Button variant="outline" type="button" onclick={resetClassForm}>
							{t('common.cancel')}
						</Button>
						<Button type="submit">
							{editingClassId ? t('common.save') : t('common.add')}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	{/if}

	<!-- Classes List -->
	<div class="flex flex-col gap-3">
		{#each classes as cls (cls.id)}
			<Card>
				<div class="flex items-center gap-3 px-4 py-3">
					<!-- Expand toggle -->
					<button
						onclick={() => toggleExpand(cls.id)}
						class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
					>
						{#if expandedIds.has(cls.id)}
							<ChevronDown class="h-4 w-4" />
						{:else}
							<ChevronRight class="h-4 w-4" />
						{/if}
					</button>

					<!-- Class info -->
					<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
						<Layers class="h-4 w-4 text-primary" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="font-semibold">{cls.name}</p>
						<p class="text-xs text-muted-foreground">{cls.school}</p>
					</div>

					<!-- Section count -->
					<Badge variant="secondary" class="gap-1">
						{cls.sections.length} section{cls.sections.length !== 1 ? 's' : ''}
					</Badge>

					<!-- Actions -->
					<Button
						variant="ghost"
						size="sm"
						onclick={() => openAddSection(cls.id)}
						class="gap-1 text-xs"
					>
						<Plus class="h-3 w-3" />
						Section
					</Button>
					<button
						onclick={() => openEditClass(cls)}
						class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						title={t('common.edit')}
					>
						<Pencil class="h-3.5 w-3.5" />
					</button>
					<button
						onclick={() => deleteClass(cls.id)}
						class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
						title={t('common.delete')}
					>
						<Trash2 class="h-3.5 w-3.5" />
					</button>
				</div>

				<!-- Expanded: sections list -->
				{#if expandedIds.has(cls.id)}
					<div class="border-t border-border/50 bg-muted/20 px-4 py-3">
						{#if cls.sections.length === 0 && addingSectionForClassId !== cls.id}
							<p class="py-2 text-center text-sm text-muted-foreground">
								No sections yet. Click "Section" to add one.
							</p>
						{/if}

						{#if cls.sections.length > 0}
							<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
								{#each cls.sections as section (section.id)}
									<div class="flex items-center justify-between rounded-lg border border-border bg-background p-3">
										<div>
											<p class="text-sm font-medium">{section.name}</p>
											<p class="text-xs text-muted-foreground">
												{section.studentCount}/{section.capacity} students
											</p>
										</div>
										<div class="flex items-center gap-1">
											<div class="mr-2 h-1.5 w-16 overflow-hidden rounded-full bg-muted">
												<div
													class="h-full rounded-full transition-all {section.studentCount / section.capacity > 0.9
														? 'bg-destructive'
														: section.studentCount / section.capacity > 0.7
															? 'bg-warning'
															: 'bg-primary'}"
													style:width="{Math.min(100, (section.studentCount / section.capacity) * 100)}%"
												></div>
											</div>
											<button
												onclick={() => deleteSection(cls.id, section.id)}
												class="rounded-md p-1 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
												title="Remove section"
											>
												<Trash2 class="h-3 w-3" />
											</button>
										</div>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Add section form (inline) -->
						{#if addingSectionForClassId === cls.id}
							<form
								onsubmit={(e) => handleSectionSubmit(e, cls.id)}
								class="mt-3 flex items-end gap-3 rounded-lg border border-primary/20 bg-background p-3"
							>
								<div class="flex-1 space-y-1">
									<Label class="text-xs font-medium">Section Name</Label>
									<Input
										placeholder="e.g. Section A"
										bind:value={sectionName}
										required
									/>
								</div>
								<div class="w-28 space-y-1">
									<Label class="text-xs font-medium">Capacity</Label>
									<Input
										type="number"
										min="1"
										bind:value={sectionCapacity}
										required
									/>
								</div>
								<div class="flex gap-2">
									<Button variant="outline" size="sm" type="button" onclick={cancelAddSection}>
										{t('common.cancel')}
									</Button>
									<Button size="sm" type="submit">
										{t('common.add')}
									</Button>
								</div>
							</form>
						{/if}
					</div>
				{/if}
			</Card>
		{/each}
	</div>

	{#if classes.length === 0}
		<Card>
			<CardContent class="flex flex-col items-center gap-3 py-12">
				<Layers class="h-10 w-10 text-muted-foreground/30" />
				<p class="text-sm text-muted-foreground">No classes created yet</p>
				<Button onclick={openAddClass} variant="outline" class="gap-2">
					<Plus class="h-4 w-4" />
					Add your first class
				</Button>
			</CardContent>
		</Card>
	{/if}
</div>
