<script lang="ts">
	import { t } from '$lib/i18n/index.svelte'
	import { goto } from '$app/navigation'
	import { Button } from '$lib/components/ui/button'
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card'
	import { Badge } from '$lib/components/ui/badge'
	import Papa from 'papaparse'
	import {
		Upload,
		Download,
		FileText,
		CheckCircle,
		AlertCircle,
		ArrowLeft,
		X,
	} from 'lucide-svelte'

	// ── State ──────────────────────────────────────────────────────────
	let parsedRows = $state<Record<string, string>[]>([])
	let errors = $state<{ row: number; message: string }[]>([])
	let fileName = $state('')
	let isDragging = $state(false)

	// ── Computed ───────────────────────────────────────────────────────
	let validCount = $derived(parsedRows.length - errors.length)
	let errorCount = $derived(errors.length)
	let errorRowSet = $derived(new Set(errors.map((e) => e.row)))
	let previewRows = $derived(parsedRows.slice(0, 10))
	let columns = $derived(parsedRows.length > 0 ? Object.keys(parsedRows[0]) : [])

	// ── Required columns ──────────────────────────────────────────────
	const requiredColumns = ['name', 'roll_number', 'class', 'section']

	// ── File handling ─────────────────────────────────────────────────
	function handleFile(file: File) {
		if (!file.name.endsWith('.csv')) return
		fileName = file.name
		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete(results) {
				parsedRows = results.data as Record<string, string>[]
				validateRows()
			},
		})
	}

	function validateRows() {
		const errs: { row: number; message: string }[] = []
		for (let i = 0; i < parsedRows.length; i++) {
			const row = parsedRows[i]
			for (const col of requiredColumns) {
				if (!row[col] || !row[col].trim()) {
					errs.push({ row: i, message: `Row ${i + 1}: Missing "${col}"` })
					break
				}
			}
		}
		errors = errs
	}

	function onFileInput(e: Event) {
		const input = e.target as HTMLInputElement
		if (input.files?.[0]) handleFile(input.files[0])
	}

	function onDrop(e: DragEvent) {
		e.preventDefault()
		isDragging = false
		if (e.dataTransfer?.files?.[0]) handleFile(e.dataTransfer.files[0])
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault()
		isDragging = true
	}

	function onDragLeave() {
		isDragging = false
	}

	function clearFile() {
		parsedRows = []
		errors = []
		fileName = ''
	}

	function importValid() {
		// In a real app, this would send to Convex
		const valid = parsedRows.filter((_, i) => !errorRowSet.has(i))
		alert(`Imported ${valid.length} students successfully!`)
		goto('/students')
	}

	// ── Template download ─────────────────────────────────────────────
	function downloadTemplate() {
		const csv = 'name,email,roll_number,class,section,guardian_name,guardian_phone\nJohn Doe,john@example.com,001,Grade 10,A,Jane Doe,9841000000'
		const blob = new Blob([csv], { type: 'text/csv' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'student_import_template.csv'
		a.click()
		URL.revokeObjectURL(url)
	}

	// ── Export helpers ─────────────────────────────────────────────────
	function exportSample(type: string) {
		let csv = ''
		if (type === 'students') {
			csv = 'Roll#,Name,Class,Section,Status\n001,Aayush Bhandari,Grade 10,A,Active\n002,Priya Tamang,Grade 10,A,Active'
		} else if (type === 'attendance') {
			csv = 'Date,Roll#,Name,Status\n2026-03-19,001,Aayush Bhandari,Present\n2026-03-19,002,Priya Tamang,Absent'
		} else if (type === 'results') {
			csv = 'Roll#,Name,Subject,Marks,Total\n001,Aayush Bhandari,Math,85,100\n002,Priya Tamang,Math,92,100'
		}
		const blob = new Blob([csv], { type: 'text/csv' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `${type}_export.csv`
		a.click()
		URL.revokeObjectURL(url)
	}
</script>

<div class="flex flex-col gap-6">
	<!-- Header -->
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="sm" onclick={() => goto('/students')} class="gap-1">
			<ArrowLeft class="h-4 w-4" />
			{t('common.back')}
		</Button>
		<div>
			<h1 class="text-2xl font-bold tracking-tight">{t('students.importCsv')}</h1>
			<p class="text-sm text-muted-foreground">Import students from a CSV file or export data</p>
		</div>
	</div>

	<!-- Upload Zone -->
	{#if parsedRows.length === 0}
		<Card>
			<CardContent class="py-8">
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-12 transition-colors
						{isDragging ? 'border-primary bg-primary/5' : 'border-border'}"
					ondrop={onDrop}
					ondragover={onDragOver}
					ondragleave={onDragLeave}
				>
					<div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
						<Upload class="h-8 w-8 text-primary" />
					</div>
					<div class="text-center">
						<p class="text-lg font-semibold">Drop CSV here</p>
						<p class="text-sm text-muted-foreground">or click to browse</p>
					</div>
					<label class="cursor-pointer">
						<Button variant="outline" class="gap-2">
							<FileText class="h-4 w-4" />
							Choose File
						</Button>
						<input type="file" accept=".csv" class="hidden" onchange={onFileInput} />
					</label>
				</div>

				<div class="mt-6 flex justify-center">
					<Button variant="ghost" onclick={downloadTemplate} class="gap-2 text-sm">
						<Download class="h-4 w-4" />
						Download Template
					</Button>
				</div>
			</CardContent>
		</Card>
	{:else}
		<!-- File info + validation summary -->
		<div class="flex items-center gap-4">
			<Badge variant="outline" class="gap-1.5 px-3 py-1.5">
				<FileText class="h-3.5 w-3.5" />
				{fileName}
			</Badge>
			<Badge variant="success" class="gap-1.5 px-3 py-1">
				<CheckCircle class="h-3.5 w-3.5" />
				{validCount} valid
			</Badge>
			{#if errorCount > 0}
				<Badge variant="destructive" class="gap-1.5 px-3 py-1">
					<AlertCircle class="h-3.5 w-3.5" />
					{errorCount} with errors
				</Badge>
			{/if}
			<div class="ml-auto flex gap-2">
				<Button variant="ghost" size="sm" onclick={clearFile} class="gap-1">
					<X class="h-4 w-4" />
					Clear
				</Button>
				<Button onclick={importValid} class="gap-2" disabled={validCount === 0}>
					<Upload class="h-4 w-4" />
					Import {validCount} Valid Rows
				</Button>
			</div>
		</div>

		<!-- Error list -->
		{#if errors.length > 0}
			<Card class="border-destructive/30">
				<CardHeader class="pb-2">
					<CardTitle class="text-sm text-destructive">Validation Errors</CardTitle>
				</CardHeader>
				<CardContent>
					<ul class="space-y-1 text-sm">
						{#each errors as err}
							<li class="flex items-center gap-2 text-destructive">
								<AlertCircle class="h-3.5 w-3.5 shrink-0" />
								{err.message}
							</li>
						{/each}
					</ul>
				</CardContent>
			</Card>
		{/if}

		<!-- Preview table -->
		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm">Preview (first 10 rows)</CardTitle>
			</CardHeader>
			<CardContent class="p-0">
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-border bg-muted/30">
								<th class="px-4 py-2 text-left font-medium text-muted-foreground">#</th>
								{#each columns as col}
									<th class="px-4 py-2 text-left font-medium text-muted-foreground">{col}</th>
								{/each}
							</tr>
						</thead>
						<tbody class="divide-y divide-border/50">
							{#each previewRows as row, i}
								<tr class="{errorRowSet.has(i) ? 'bg-destructive/5' : ''} transition-colors hover:bg-muted/20">
									<td class="px-4 py-2 text-muted-foreground">{i + 1}</td>
									{#each columns as col}
										<td class="px-4 py-2">{row[col] ?? ''}</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Export Section -->
	<Card>
		<CardHeader>
			<CardTitle class="text-base">Export Data</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="flex gap-3">
				<Button variant="outline" onclick={() => exportSample('students')} class="gap-2">
					<Download class="h-4 w-4" />
					Export Students
				</Button>
				<Button variant="outline" onclick={() => exportSample('attendance')} class="gap-2">
					<Download class="h-4 w-4" />
					Export Attendance
				</Button>
				<Button variant="outline" onclick={() => exportSample('results')} class="gap-2">
					<Download class="h-4 w-4" />
					Export Results
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
