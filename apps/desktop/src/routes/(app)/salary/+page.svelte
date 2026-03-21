<script lang="ts">
import { Badge } from '$lib/components/ui/badge'
import { Button } from '$lib/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card'
import { Input } from '$lib/components/ui/input'
import { Label } from '$lib/components/ui/label'
import { Select } from '$lib/components/ui/select'
import { Separator } from '$lib/components/ui/separator'
import { api, convexMutation, convexQuery, isConvexConfigured } from '$lib/convex'
import { t } from '$lib/i18n/index.svelte'
import { getSchool } from '$lib/stores/school.svelte'
import {
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Clock,
	DollarSign,
	Plus,
	TrendingUp,
	X,
} from 'lucide-svelte'
import { onMount } from 'svelte'

// ── Teacher list for dropdown ──────────────────────────────────────────────
type TeacherOption = { id: string; name: string; department: string; employeeId: string }
let teacherOptions = $state<TeacherOption[]>([])

onMount(async () => {
	if (!isConvexConfigured()) return
	const schoolId = getSchool()?.id
	if (!schoolId) return
	try {
		const teachers = await convexQuery(api.people.listTeachersBySchool, { schoolId }, [] as any[])
		if (Array.isArray(teachers)) {
			teacherOptions = teachers.map((t: any) => ({
				id: t._id ?? t.id,
				name: t.user?.name ?? '',
				department: t.department ?? '',
				employeeId: t.employeeId ?? '',
			}))
		}
	} catch {
		/* ignore */
	}
})

let formSelectedTeacherId = $state('')

function onTeacherSelected() {
	const teacher = teacherOptions.find((t) => t.id === formSelectedTeacherId)
	if (teacher) {
		formName = teacher.name
		formEmployeeId = teacher.employeeId
		formDepartment = teacher.department
	}
}

type SalaryStatus = 'paid' | 'pending' | 'cancelled'

interface SalaryRecord {
	id: string
	employeeId: string
	name: string
	department: string
	baseSalary: number
	deductions: number
	bonuses: number
	status: SalaryStatus
	notes: string
	expanded: boolean
}

let selectedMonth = $state('2026-03')

// ── Convex loading (re-runs whenever selectedMonth changes) ──────────────────
$effect(() => {
	const month = selectedMonth
	;(async () => {
		try {
			const records = await convexQuery(api.salary.listByMonth, { month }, [])
			if (Array.isArray(records) && records.length > 0) {
				salaryRecords = records.map((r: any) => ({
					id: r._id ?? r.id,
					employeeId: r.teacherId ?? r.employeeId ?? '',
					name: r.teacherName ?? r.name ?? '',
					department: r.department ?? '',
					baseSalary: r.baseSalary ?? 0,
					deductions: r.deductions ?? 0,
					bonuses: r.bonuses ?? 0,
					status: r.status ?? 'pending',
					notes: r.notes ?? '',
					expanded: false,
				}))
			}
		} catch {
			salaryRecords = []
		}
	})()
})

let salaryRecords = $state<SalaryRecord[]>([])

const netSalary = (r: SalaryRecord) => r.baseSalary - r.deductions + r.bonuses

const totalPayroll = $derived(salaryRecords.reduce((s, r) => s + netSalary(r), 0))
const totalPaid = $derived(
	salaryRecords.filter((r) => r.status === 'paid').reduce((s, r) => s + netSalary(r), 0),
)
const totalPending = $derived(
	salaryRecords.filter((r) => r.status === 'pending').reduce((s, r) => s + netSalary(r), 0),
)
const averageSalary = $derived(
	salaryRecords.length > 0 ? Math.round(totalPayroll / salaryRecords.length) : 0,
)

// Form state
let showForm = $state(false)
let editingId = $state<string | null>(null)
let formName = $state('')
let formEmployeeId = $state('')
let formDepartment = $state('')
let formBaseSalary = $state('')
let formDeductions = $state('')
let formBonuses = $state('')
let formNotes = $state('')
const formNetSalary = $derived(
	(Number(formBaseSalary) || 0) - (Number(formDeductions) || 0) + (Number(formBonuses) || 0),
)

function openAddForm() {
	editingId = null
	formName = ''
	formEmployeeId = ''
	formDepartment = ''
	formBaseSalary = ''
	formDeductions = ''
	formBonuses = ''
	formNotes = ''
	showForm = true
}

function openEditForm(record: SalaryRecord) {
	editingId = record.id
	formName = record.name
	formEmployeeId = record.employeeId
	formDepartment = record.department
	formBaseSalary = String(record.baseSalary)
	formDeductions = String(record.deductions)
	formBonuses = String(record.bonuses)
	formNotes = record.notes
	formSelectedTeacherId = record.employeeId
	showForm = true
}

async function saveForm() {
	const base = Number(formBaseSalary) || 0
	const ded = Number(formDeductions) || 0
	const bon = Number(formBonuses) || 0

	if (editingId) {
		const idx = salaryRecords.findIndex((r) => r.id === editingId)
		if (idx !== -1) {
			salaryRecords[idx] = {
				...salaryRecords[idx],
				name: formName,
				employeeId: formEmployeeId,
				department: formDepartment,
				baseSalary: base,
				deductions: ded,
				bonuses: bon,
				notes: formNotes,
			}
		}
		// Convex: update the record
		try {
			await convexMutation(api.salary.update, {
				id: editingId,
				baseSalary: base,
				deductions: ded,
				bonuses: bon,
				notes: formNotes || undefined,
			})
		} catch {
			// Local state already updated; continue
		}
	} else {
		const localId = String(Date.now())
		salaryRecords.push({
			id: localId,
			employeeId: formEmployeeId,
			name: formName,
			department: formDepartment,
			baseSalary: base,
			deductions: ded,
			bonuses: bon,
			status: 'pending',
			notes: formNotes,
			expanded: false,
		})
		// Convex: create a new record
		try {
			await convexMutation(api.salary.create, {
				teacherId: formEmployeeId,
				month: selectedMonth,
				baseSalary: base,
				deductions: ded,
				bonuses: bon,
				notes: formNotes || undefined,
			})
		} catch {
			// Keep local entry as fallback
		}
	}
	showForm = false
}

async function markPaid(id: string) {
	const idx = salaryRecords.findIndex((r) => r.id === id)
	if (idx !== -1) salaryRecords[idx].status = 'paid'
	// Convex: persist paid status
	try {
		await convexMutation(api.salary.markPaid, { id })
	} catch {
		// Local state already updated; continue
	}
}

async function payAll() {
	const pending = salaryRecords.filter((r) => r.status === 'pending')
	// Update local state immediately
	for (const r of pending) r.status = 'paid'
	// Persist to Convex
	if (isConvexConfigured()) {
		for (const r of pending) {
			try {
				await convexMutation(api.salary.markPaid, { id: r.id })
			} catch {}
		}
	}
}

function toggleExpand(id: string) {
	const idx = salaryRecords.findIndex((r) => r.id === id)
	if (idx !== -1) salaryRecords[idx].expanded = !salaryRecords[idx].expanded
}

function formatNPR(amount: number) {
	return `NPR ${amount.toLocaleString('en-IN')}`
}

const statusVariant = (status: SalaryStatus) => {
	if (status === 'paid') return 'success'
	if (status === 'pending') return 'warning'
	return 'destructive'
}
</script>

<div class="flex flex-col gap-6 p-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">{t('salary.management')}</h1>
      <p class="text-sm text-muted-foreground">{t('salary.managePayments')}</p>
    </div>
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <Label for="month-select">{t('salary.month')}</Label>
        <Select
          id="month-select"
          bind:value={selectedMonth}
          class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="2026-03">March 2026</option>
          <option value="2026-02">February 2026</option>
          <option value="2026-01">January 2026</option>
          <option value="2025-12">December 2025</option>
          <option value="2025-11">November 2025</option>
        </Select>
      </div>
      <Button onclick={openAddForm} size="sm">
        <Plus />
        {t('salary.addRecord')}
      </Button>
      <Button onclick={payAll} variant="default" size="sm">
        <CheckCircle />
        {t('salary.payAll')}
      </Button>
    </div>
  </div>

  <!-- Summary Cards -->
  <div class="grid grid-cols-4 gap-4">
    <Card>
      <CardContent class="flex items-center gap-4 p-5">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <DollarSign class="h-5 w-5 text-primary" />
        </div>
        <div>
          <p class="text-xs text-muted-foreground">{t('salary.totalPayroll')}</p>
          <p class="text-lg font-bold">{formatNPR(totalPayroll)}</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="flex items-center gap-4 p-5">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
          <CheckCircle class="h-5 w-5 text-success" />
        </div>
        <div>
          <p class="text-xs text-muted-foreground">{t('salary.paid')}</p>
          <p class="text-lg font-bold text-success">{formatNPR(totalPaid)}</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="flex items-center gap-4 p-5">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
          <Clock class="h-5 w-5 text-warning" />
        </div>
        <div>
          <p class="text-xs text-muted-foreground">{t('salary.pending')}</p>
          <p class="text-lg font-bold text-warning">{formatNPR(totalPending)}</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="flex items-center gap-4 p-5">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <TrendingUp class="h-5 w-5 text-secondary-foreground" />
        </div>
        <div>
          <p class="text-xs text-muted-foreground">{t('salary.averageSalary')}</p>
          <p class="text-lg font-bold">{formatNPR(averageSalary)}</p>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Add / Edit Form -->
  {#if showForm}
    <Card class="border-primary/30">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>{editingId ? t('salary.editRecord') : t('salary.addRecord')}</CardTitle>
          <Button
            onclick={() => (showForm = false)}
            class="rounded-md p-1 hover:bg-accent"
            aria-label="Close"
          >
            <X class="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-3 gap-4">
          <div class="col-span-3 flex flex-col gap-1.5">
            <Label for="f-teacher">Select Teacher</Label>
            <Select
              id="f-teacher"
              bind:value={formSelectedTeacherId}
              onchange={onTeacherSelected}
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Choose a teacher...</option>
              {#each teacherOptions as teacher}
                <option value={teacher.id}>{teacher.name} ({teacher.employeeId || 'No ID'})</option>
              {/each}
            </Select>
          </div>
          {#if formName}
            <div class="flex flex-col gap-1.5">
              <Label class="text-muted-foreground text-xs">{t('common.name')}</Label>
              <p class="text-sm font-medium px-3 py-2 bg-muted/40 rounded-md">{formName}</p>
            </div>
            <div class="flex flex-col gap-1.5">
              <Label class="text-muted-foreground text-xs">{t('teachers.employeeId')}</Label>
              <p class="text-sm font-medium px-3 py-2 bg-muted/40 rounded-md font-mono">{formEmployeeId || '—'}</p>
            </div>
            <div class="flex flex-col gap-1.5">
              <Label class="text-muted-foreground text-xs">{t('teachers.department')}</Label>
              <p class="text-sm font-medium px-3 py-2 bg-muted/40 rounded-md">{formDepartment || '—'}</p>
            </div>
          {/if}
          <div class="flex flex-col gap-1.5">
            <Label for="f-base">{t('salary.baseSalary')}</Label>
            <Input id="f-base" type="number" bind:value={formBaseSalary} placeholder="35000" />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="f-ded">{t('salary.deductions')}</Label>
            <Input id="f-ded" type="number" bind:value={formDeductions} placeholder="2500" />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="f-bon">{t('salary.bonuses')}</Label>
            <Input id="f-bon" type="number" bind:value={formBonuses} placeholder="0" />
          </div>
          <div class="col-span-3 flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border">
            <span class="text-sm text-muted-foreground">{t('salary.netSalary')}:</span>
            <span class="text-lg font-bold">{formatNPR(formNetSalary)}</span>
            <span class="text-xs text-muted-foreground ml-2">(base - deductions + bonuses)</span>
          </div>
          <div class="col-span-3 flex flex-col gap-1.5">
            <Label for="f-notes">{t('common.notes')}</Label>
            <Input id="f-notes" bind:value={formNotes} placeholder="Optional notes..." />
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <Button onclick={saveForm}>{t('common.save')}</Button>
          <Button variant="outline" onclick={() => (showForm = false)}>{t('common.cancel')}</Button>
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Salary Table -->
  <Card>
    <CardHeader>
      <CardTitle>{t('salary.staffRecords')} — {selectedMonth}</CardTitle>
    </CardHeader>
    <CardContent class="p-0">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/40">
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Emp ID</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">{t('common.name')}</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">{t('teachers.department')}</th>
              <th class="px-4 py-3 text-right font-medium text-muted-foreground">{t('salary.baseSalary')}</th>
              <th class="px-4 py-3 text-right font-medium text-muted-foreground">{t('salary.deductions')}</th>
              <th class="px-4 py-3 text-right font-medium text-muted-foreground">{t('salary.bonuses')}</th>
              <th class="px-4 py-3 text-right font-medium text-muted-foreground">{t('salary.netSalary')}</th>
              <th class="px-4 py-3 text-center font-medium text-muted-foreground">{t('common.status')}</th>
              <th class="px-4 py-3 text-center font-medium text-muted-foreground">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {#each salaryRecords as record (record.id)}
              <tr
                class="border-b border-border/50 transition-colors hover:bg-muted/20"
              >
                <td class="px-4 py-3 font-mono text-xs text-muted-foreground">{record.employeeId}</td>
                <td class="px-4 py-3 font-medium">{record.name}</td>
                <td class="px-4 py-3 text-muted-foreground">{record.department}</td>
                <td class="px-4 py-3 text-right">{formatNPR(record.baseSalary)}</td>
                <td class="px-4 py-3 text-right text-destructive">−{formatNPR(record.deductions)}</td>
                <td class="px-4 py-3 text-right text-success">+{formatNPR(record.bonuses)}</td>
                <td class="px-4 py-3 text-right font-semibold">{formatNPR(netSalary(record))}</td>
                <td class="px-4 py-3 text-center">
                  <Badge variant={statusVariant(record.status)}>
                    {record.status === 'paid' ? t('salary.paid') : record.status === 'pending' ? t('salary.pending') : t('salary.cancelled')}
                  </Badge>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-center gap-1">
                    {#if record.status === 'pending'}
                      <Button size="sm" variant="outline" onclick={() => markPaid(record.id)}>
                        {t('salary.markPaid')}
                      </Button>
                    {/if}
                    <Button size="sm" variant="ghost" onclick={() => openEditForm(record)}>
                      {t('common.edit')}
                    </Button>
                    <Button
                      onclick={() => toggleExpand(record.id)}
                      class="rounded p-1 hover:bg-accent"
                      aria-label="Expand"
                    >
                      {#if record.expanded}
                        <ChevronUp class="h-4 w-4" />
                      {:else}
                        <ChevronDown class="h-4 w-4" />
                      {/if}
                    </Button>
                  </div>
                </td>
              </tr>
              {#if record.expanded}
                <tr class="bg-muted/10">
                  <td colspan="9" class="px-6 py-3">
                    <div class="flex items-start gap-2 text-sm">
                      <span class="font-medium text-muted-foreground">Notes:</span>
                      <span>{record.notes || 'No notes for this record.'}</span>
                    </div>
                    <div class="mt-2 grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                      <span>Net = {formatNPR(record.baseSalary)} − {formatNPR(record.deductions)} + {formatNPR(record.bonuses)} = <strong class="text-foreground">{formatNPR(netSalary(record))}</strong></span>
                    </div>
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
</div>
