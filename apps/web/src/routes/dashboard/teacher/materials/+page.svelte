<script lang="ts">
import Badge from '$lib/components/ui/badge.svelte'
import Button from '$lib/components/ui/button.svelte'
import Card from '$lib/components/ui/card.svelte'
import Input from '$lib/components/ui/input.svelte'
import Select from '$lib/components/ui/select.svelte'
import Textarea from '$lib/components/ui/textarea.svelte'
import { t } from '$lib/i18n/index.js'

const { data } = $props()

type MaterialType = 'video' | 'pdf' | 'link' | 'document'

interface Material {
	id: string
	title: string
	type: MaterialType
	url: string
	description: string
}

interface Topic {
	name: string
	materials: Material[]
}

interface Module {
	name: string
	topics: Topic[]
}

interface Subject {
	name: string
	modules: Module[]
}

const subjectsData: Subject[] = data.subjectsData ?? [
	{
		name: 'Mathematics',
		modules: [
			{
				name: 'Algebra',
				topics: [
					{
						name: 'Linear Equations',
						materials: [
							{
								id: 'm1',
								title: 'Introduction to Linear Equations',
								type: 'video',
								url: 'https://example.com/video1',
								description: 'Basics of linear equations in one variable',
							},
							{
								id: 'm2',
								title: 'Linear Equations Worksheet',
								type: 'pdf',
								url: 'https://example.com/pdf1',
								description: 'Practice problems for linear equations',
							},
						],
					},
					{
						name: 'Quadratic Equations',
						materials: [
							{
								id: 'm3',
								title: 'Quadratic Formula',
								type: 'link',
								url: 'https://example.com/quadratic',
								description: 'Complete guide to the quadratic formula',
							},
						],
					},
				],
			},
			{
				name: 'Geometry',
				topics: [
					{
						name: 'Triangles',
						materials: [
							{
								id: 'm4',
								title: 'Types of Triangles',
								type: 'document',
								url: '',
								description: 'Classification and properties of triangles',
							},
						],
					},
					{ name: 'Circles', materials: [] },
				],
			},
		],
	},
	{
		name: 'Science',
		modules: [
			{
				name: 'Physics',
				topics: [
					{
						name: 'Motion',
						materials: [
							{
								id: 'm5',
								title: 'Newton Laws of Motion',
								type: 'video',
								url: 'https://example.com/newton',
								description: 'All three laws explained with examples',
							},
						],
					},
					{ name: 'Energy', materials: [] },
				],
			},
		],
	},
]

let selectedSubjectIdx = $state(0)
let selectedModuleIdx = $state(0)
let selectedTopicIdx = $state(0)

const currentSubject = $derived(subjectsData[selectedSubjectIdx])
const currentModule = $derived(currentSubject?.modules[selectedModuleIdx])
const currentTopic = $derived(currentModule?.topics[selectedTopicIdx])

// Deep copy materials for reactivity
let topicMaterials: Map<string, Material[]> = $state(new Map())

function getMaterialsKey(): string {
	return `${selectedSubjectIdx}-${selectedModuleIdx}-${selectedTopicIdx}`
}

function getCurrentMaterials(): Material[] {
	const key = getMaterialsKey()
	if (topicMaterials.has(key)) return topicMaterials.get(key)!
	return currentTopic?.materials ?? []
}

// Add material form
let newTitle = $state('')
let newType: MaterialType = $state('video')
let newUrl = $state('')
let newDescription = $state('')

const materialTypes: MaterialType[] = ['video', 'pdf', 'link', 'document']

const typeColors: Record<MaterialType, string> = {
	video: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
	pdf: 'bg-red-500/10 text-red-600 dark:text-red-400',
	link: 'bg-green-500/10 text-green-600 dark:text-green-400',
	document: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
}

function addMaterial() {
	if (!newTitle.trim()) return
	const key = getMaterialsKey()
	const existing = getCurrentMaterials()
	const material: Material = {
		id: `m-${Date.now()}`,
		title: newTitle,
		type: newType,
		url: newUrl,
		description: newDescription,
	}
	topicMaterials.set(key, [...existing, material])
	topicMaterials = new Map(topicMaterials)
	newTitle = ''
	newUrl = ''
	newDescription = ''
	newType = 'video'
}

function deleteMaterial(id: string) {
	const key = getMaterialsKey()
	const existing = getCurrentMaterials()
	topicMaterials.set(
		key,
		existing.filter((m) => m.id !== id),
	)
	topicMaterials = new Map(topicMaterials)
}

function handleSubjectChange(e: Event) {
	selectedSubjectIdx = Number((e.target as HTMLSelectElement).value)
	selectedModuleIdx = 0
	selectedTopicIdx = 0
}

function handleModuleChange(e: Event) {
	selectedModuleIdx = Number((e.target as HTMLSelectElement).value)
	selectedTopicIdx = 0
}
</script>

<svelte:head>
	<title>{$t('materials.title')} | MeroSchool</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-foreground">{$t('materials.title')}</h1>

	<!-- Breadcrumb -->
	<div class="flex items-center gap-2 text-sm text-muted-foreground">
		<span class="font-medium text-foreground">{currentSubject?.name}</span>
		<span>&rsaquo;</span>
		<span class="font-medium text-foreground">{currentModule?.name}</span>
		<span>&rsaquo;</span>
		<span class="font-medium text-primary">{currentTopic?.name}</span>
	</div>

	<!-- Selectors -->
	<Card class="p-4">
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			<div>
				<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('materials.subject')}</label>
				<Select value={String(selectedSubjectIdx)} onchange={handleSubjectChange}>
					{#each subjectsData as subj, i}
						<option value={String(i)}>{subj.name}</option>
					{/each}
				</Select>
			</div>
			<div>
				<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('materials.module')}</label>
				<Select value={String(selectedModuleIdx)} onchange={handleModuleChange}>
					{#each currentSubject?.modules ?? [] as mod, i}
						<option value={String(i)}>{mod.name}</option>
					{/each}
				</Select>
			</div>
			<div>
				<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('materials.topic')}</label>
				<Select bind:value={selectedTopicIdx}>
					{#each currentModule?.topics ?? [] as topic, i}
						<option value={i}>{topic.name}</option>
					{/each}
				</Select>
			</div>
		</div>
	</Card>

	<!-- Materials List -->
	<div>
		<h2 class="text-lg font-semibold text-foreground mb-3">{$t('materials.materialsFor')} "{currentTopic?.name}"</h2>
		{#if getCurrentMaterials().length === 0}
			<Card class="p-8 text-center">
				<p class="text-muted-foreground">{$t('materials.noMaterials')}</p>
			</Card>
		{:else}
			<div class="space-y-3">
				{#each getCurrentMaterials() as material}
					<Card class="p-4">
						<div class="flex items-start justify-between gap-4">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-1">
									<h3 class="text-sm font-semibold text-foreground">{material.title}</h3>
									<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {typeColors[material.type]}">
										{$t(`materials.type.${material.type}`)}
									</span>
								</div>
								<p class="text-sm text-muted-foreground">{material.description}</p>
								{#if material.url}
									<a href={material.url} target="_blank" rel="noopener" class="text-xs text-primary hover:underline mt-1 inline-block">{material.url}</a>
								{/if}
							</div>
							<Button variant="destructive" size="sm" onclick={() => deleteMaterial(material.id)}>
								{$t('materials.delete')}
							</Button>
						</div>
					</Card>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Add Material -->
	<Card class="p-6">
		<h2 class="text-lg font-semibold text-foreground mb-4">{$t('materials.addMaterial')}</h2>
		<div class="space-y-4">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('materials.materialTitle')}</label>
					<Input bind:value={newTitle} placeholder={$t('materials.titlePlaceholder')} />
				</div>
				<div>
					<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('materials.materialType')}</label>
					<Select bind:value={newType}>
						{#each materialTypes as mType}
							<option value={mType}>{$t(`materials.type.${mType}`)}</option>
						{/each}
					</Select>
				</div>
			</div>
			<div>
				<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('materials.url')}</label>
				<Input bind:value={newUrl} placeholder="https://..." />
			</div>
			<div>
				<label class="text-sm font-medium text-foreground mb-1.5 block">{$t('materials.description')}</label>
				<Textarea bind:value={newDescription} placeholder={$t('materials.descriptionPlaceholder')} rows={3} />
			</div>
			<!-- File upload zone -->
			<div class="rounded-lg border-2 border-dashed border-input p-8 text-center">
				<div class="text-muted-foreground">
					<svg class="mx-auto h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
					</svg>
					<p class="text-sm">{$t('materials.uploadArea')}</p>
					<p class="text-xs mt-1">{$t('materials.uploadHint')}</p>
				</div>
			</div>
			<div class="flex justify-end">
				<Button onclick={addMaterial} disabled={!newTitle.trim()}>{$t('materials.addMaterial')}</Button>
			</div>
		</div>
	</Card>
</div>
