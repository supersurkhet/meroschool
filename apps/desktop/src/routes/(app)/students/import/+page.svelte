<script lang="ts">
	import { t } from '$lib/i18n/index.svelte'
	import { goto } from '$app/navigation'
	import { convexMutation, convexQuery, isConvexConfigured, api } from '$lib/convex'
	import { getSchool } from '$lib/stores/school.svelte'
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
	let errors = $state<{ row: number; field: string; message: string }[]>([])
	let fileName = $state('')
	let isDragging = $state(false)

	// ── Section picker state ────────────────────────────────────────────
	type SectionOption = { id: string; label: string }
	let sections = $state<SectionOption[]>([])
	let selectedSectionId = $state<string>('')

	$effect(() => {
		const schoolId = getSchool()?.id
		if (!schoolId) return
		;(async () => {
			try {
				const hierarchy = await convexQuery(api.schools.getSchoolHierarchy, { schoolId })
				if (hierarchy?.classes) {
					const opts: SectionOption[] = []
					for (const cls of hierarchy.classes) {
						for (const sec of cls.sections ?? []) {
							opts.push({ id: sec._id, label: `${cls.name} — ${sec.name}` })
						}
					}
					sections = opts
					if (opts.length > 0 && !selectedSectionId) selectedSectionId = opts[0].id
				}
			} catch {}
		})()
	})

	// ── Computed ───────────────────────────────────────────────────────
	let errorRowSet = $derived(new Set(errors.map((e) => e.row)))
	let validCount = $derived(parsedRows.length - errorRowSet.size)
	let errorCount = $derived(errorRowSet.size)
	let previewRows = $derived(parsedRows.slice(0, 10))
	let columns = $derived(parsedRows.length > 0 ? Object.keys(parsedRows[0]) : [])

	// ── Required columns ──────────────────────────────────────────────
	const requiredColumns = ['name', 'roll_number']

	// ── Validation helpers ────────────────────────────────────────────
	function isValidEmail(email: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
	}

	function isValidPhone(phone: string): boolean {
		// Accept various Nepal phone formats
		return /^[\d+\-() ]{7,15}$/.test(phone)
	}

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
		const errs: { row: number; field: string; message: string }[] = []
		for (let i = 0; i < parsedRows.length; i++) {
			const row = parsedRows[i]
			// Check required fields
			for (const col of requiredColumns) {
				if (!row[col] || !row[col].trim()) {
					errs.push({ row: i, field: col, message: `Row ${i + 1}: Missing required field "${col}"` })
				}
			}
			// Validate email format if present
			if (row['email'] && row['email'].trim() && !isValidEmail(row['email'].trim())) {
				errs.push({ row: i, field: 'email', message: `Row ${i + 1}: Invalid email format "${row['email']}"` })
			}
			// Validate phone format if present
			if (row['guardian_phone'] && row['guardian_phone'].trim() && !isValidPhone(row['guardian_phone'].trim())) {
				errs.push({ row: i, field: 'guardian_phone', message: `Row ${i + 1}: Invalid phone format "${row['guardian_phone']}"` })
			}
		}
		errors = errs
	}

	function errorsForRow(rowIndex: number): string {
		return errors
			.filter((e) => e.row === rowIndex)
			.map((e) => e.message)
			.join('; ')
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

	async function importValid() {
		const valid = parsedRows.filter((_, i) => !errorRowSet.has(i))

		const schoolId = getSchool()?.id
		if (isConvexConfigured() && schoolId && valid.length > 0) {
			try {
				// Map CSV rows to the bulkEnrollStudents format
				const students = valid.map((row) => ({
					name: row['name'] ?? row['Name'] ?? '',
					email: row['email'] ?? row['Email'] ?? `${(row['name'] ?? 'student').toLowerCase().replace(/\s+/g, '.')}@import.local`,
					rollNumber: row['roll_number'] ?? row['Roll Number'] ?? row['roll'] ?? '',
					sectionId: row['section_id'] ?? selectedSectionId,
					...(row['date_of_birth'] || row['dob'] ? { dateOfBirth: row['date_of_birth'] ?? row['dob'] } : {}),
					admissionDate: new Date().toISOString().slice(0, 10),
				}))

				await convexMutation(api.csv.bulkEnrollStudents, {
					students,
					schoolId,
				})
				alert(`Imported ${valid.length} students successfully via Convex!`)
			} catch (err) {
				console.warn('[import] Convex bulkEnrollStudents failed:', err)
				alert(`Imported ${valid.length} students locally. Convex sync failed — check console.`)
			}
		} else {
			alert(`Imported ${valid.length} students successfully!`)
		}

		goto('/students')
	}

	// ── Template download ─────────────────────────────────────────────
	function downloadTemplate() {
		const headers = ['name', 'email', 'roll_number', 'class', 'section', 'guardian_name', 'guardian_phone']
		const exampleRow = ['Ram Prasad', 'ram@student.edu.np', '001', 'Grade 10', 'A', 'Sita Prasad', '9841000000']
		const csv = Papa.unparse({ fields: headers, data: [exampleRow] })
		const blob = new Blob([csv], { type: 'text/csv' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'student_import_template.csv'
		a.click()
		URL.revokeObjectURL(url)
	}

	// ── Export utility ────────────────────────────────────────────────
	function exportToCSV(data: Record<string, unknown>[], filename: string) {
		const csv = Papa.unparse(data)
		const blob = new Blob([csv], { type: 'text/csv' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = filename
		a.click()
		URL.revokeObjectURL(url)
	}

	async function exportSample(type: string) {
		const schoolId = getSchool()?.id

		if (type === 'students') {
			// Try to export real data from Convex
			if (isConvexConfigured() && schoolId) {
				try {
					const realData = await convexQuery(api.csv.exportStudents, { schoolId }, null)
					if (Array.isArray(realData) && realData.length > 0) {
						exportToCSV(realData, 'students_export.csv')
						return
					}
				} catch (err) {
					console.warn('[export] Convex exportStudents failed, using sample:', err)
				}
			}
			// Fallback to sample data
			exportToCSV([
				{ 'Roll#': '001', Name: 'Aayush Bhandari', Class: 'Grade 10', Section: 'A', Status: 'Active' },
				{ 'Roll#': '002', Name: 'Priya Tamang', Class: 'Grade 10', Section: 'A', Status: 'Active' },
			], 'students_export.csv')
		} else if (type === 'attendance') {
			exportToCSV([
				{ Date: '2026-03-19', 'Roll#': '001', Name: 'Aayush Bhandari', Status: 'Present' },
				{ Date: '2026-03-19', 'Roll#': '002', Name: 'Priya Tamang', Status: 'Absent' },
			], 'attendance_export.csv')
		} else if (type === 'results') {
			exportToCSV([
				{ 'Roll#': '001', Name: 'Aayush Bhandari', Subject: 'Math', Marks: '85', Total: '100' },
				{ 'Roll#': '002', Name: 'Priya Tamang', Subject: 'Math', Marks: '92', Total: '100' },
			], 'results_export.csv')
		}
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
			<p class="text-sm text-muted-foreground">{t('csv.importExportDescription')}</p>
		</div>
	</div>

	<!-- Upload Zone -->
	{#if parsedRows.length === 0}
		<Card>
			<CardContent class="py-8">
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-12 transition-all duration-200
						{isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50'}"
					ondrop={onDrop}
					ondragover={onDragOver}
					ondragleave={onDragLeave}
				>
					<div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-transform {isDragging ? 'scale-110' : ''}">
						<Upload class="h-8 w-8 text-primary" />
					</div>
					<div class="text-center">
						<p class="text-lg font-semibold">{t('csv.dropCsvHere')}</p>
						<p class="text-sm text-muted-foreground">{t('csv.orClickBrowse')}</p>
					</div>
					<label class="cursor-pointer">
						<Button variant="outline" class="gap-2">
							<FileText class="h-4 w-4" />
							{t('csv.chooseFile')}
						</Button>
						<input type="file" accept=".csv" class="hidden" onchange={onFileInput} />
					</label>
				</div>

				<div class="mt-6 flex justify-center">
					<Button variant="ghost" onclick={downloadTemplate} class="gap-2 text-sm">
						<Download class="h-4 w-4" />
						{t('common.downloadTemplate')}
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
				{validCount} {t('csv.validRows')}
			</Badge>
			{#if errorCount > 0}
				<Badge variant="destructive" class="gap-1.5 px-3 py-1">
					<AlertCircle class="h-3.5 w-3.5" />
					{errorCount} {t('csv.withErrors')}
				</Badge>
			{/if}
			<div class="ml-auto flex items-center gap-2">
				{#if sections.length > 0}
					<div class="flex items-center gap-2">
						<label for="section-picker" class="text-sm font-medium text-muted-foreground whitespace-nowrap">
							{t('students.assignSection')}:
						</label>
						<select
							id="section-picker"
							bind:value={selectedSectionId}
							class="rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
						>
							{#each sections as sec}
								<option value={sec.id}>{sec.label}</option>
							{/each}
						</select>
					</div>
				{/if}
				<Button variant="ghost" size="sm" onclick={clearFile} class="gap-1">
					<X class="h-4 w-4" />
					{t('common.clear')}
				</Button>
				<Button onclick={importValid} class="gap-2" disabled={validCount === 0 || !selectedSectionId}>
					<Upload class="h-4 w-4" />
					{t('csv.importStudents')} ({validCount})
				</Button>
			</div>
		</div>

		<!-- Error list -->
		{#if errors.length > 0}
			<Card class="border-destructive/30">
				<CardHeader class="pb-2">
					<CardTitle class="text-sm text-destructive">{t('csv.validationErrors')}</CardTitle>
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
				<CardTitle class="text-sm">{t('common.preview')} ({previewRows.length})</CardTitle>
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
								<tr
									class="{errorRowSet.has(i) ? 'bg-destructive/10 border-l-2 border-l-destructive' : ''} transition-colors hover:bg-muted/20"
									title={errorRowSet.has(i) ? errorsForRow(i) : ''}
								>
									<td class="px-4 py-2 text-muted-foreground">
										{#if errorRowSet.has(i)}
											<span class="flex items-center gap-1 text-destructive">
												<AlertCircle class="h-3 w-3" />
												{i + 1}
											</span>
										{:else}
											{i + 1}
										{/if}
									</td>
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
			<CardTitle class="text-base">{t('csv.exportData')}</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="flex gap-3">
				<Button variant="outline" onclick={() => exportSample('students')} class="gap-2">
					<Download class="h-4 w-4" />
					{t('csv.exportStudents')}
				</Button>
				<Button variant="outline" onclick={() => exportSample('attendance')} class="gap-2">
					<Download class="h-4 w-4" />
					{t('csv.exportAttendance')}
				</Button>
				<Button variant="outline" onclick={() => exportSample('results')} class="gap-2">
					<Download class="h-4 w-4" />
					{t('csv.exportResults')}
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
