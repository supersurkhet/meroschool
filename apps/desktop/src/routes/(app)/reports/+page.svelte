<script lang="ts">
import { Badge } from '$lib/components/ui/badge'
import { Button } from '$lib/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card'
import { Input } from '$lib/components/ui/input'
import { Label } from '$lib/components/ui/label'
import { Select } from '$lib/components/ui/select'
import { Separator } from '$lib/components/ui/separator'
import { api, convexQuery } from '$lib/convex'
import { t } from '$lib/i18n/index.svelte'
import {
	Award,
	BarChart2,
	BookOpen,
	CheckCircle,
	Clock,
	TrendingUp,
	Users,
	XCircle,
} from 'lucide-svelte'

// ── Tab state ──────────────────────────────────────────────────
type Tab = 'attendance' | 'results' | 'performance'
let activeTab = $state<Tab>('attendance')

// ── Attendance data ────────────────────────────────────────────
let attendanceFrom = $state('2026-03-01')
let attendanceTo = $state('2026-03-20')
let attendanceClass = $state('all')

interface AttendanceRecord {
	id: string
	name: string
	rollNo: string
	class: string
	present: number
	absent: number
	late: number
	total: number
}

let attendanceData = $state<AttendanceRecord[]>([])

const filteredAttendance = $derived(
	attendanceClass === 'all'
		? attendanceData
		: attendanceData.filter((r) => r.class === attendanceClass),
)

const attendanceSummary = $derived({
	total: filteredAttendance.length,
	presentPct: Math.round(
		(filteredAttendance.reduce((s, r) => s + r.present, 0) /
			(filteredAttendance.reduce((s, r) => s + r.total, 0) || 1)) *
			100,
	),
	absentPct: Math.round(
		(filteredAttendance.reduce((s, r) => s + r.absent, 0) /
			(filteredAttendance.reduce((s, r) => s + r.total, 0) || 1)) *
			100,
	),
	latePct: Math.round(
		(filteredAttendance.reduce((s, r) => s + r.late, 0) /
			(filteredAttendance.reduce((s, r) => s + r.total, 0) || 1)) *
			100,
	),
})

// ── Exam Results data ──────────────────────────────────────────
let selectedExam = $state('midterm-2026')
let resultsClass = $state('all')

interface ExamResult {
	id: string
	name: string
	rollNo: string
	class: string
	marks: number
	totalMarks: number
}

let examResults = $state<ExamResult[]>([])

const filteredResults = $derived(
	resultsClass === 'all' ? examResults : examResults.filter((r) => r.class === resultsClass),
)

function gradeFor(pct: number): string {
	if (pct >= 90) return 'A+'
	if (pct >= 80) return 'A'
	if (pct >= 70) return 'B+'
	if (pct >= 60) return 'B'
	if (pct >= 50) return 'C'
	if (pct >= 40) return 'D'
	return 'F'
}

function gradeColor(grade: string): string {
	if (grade === 'A+' || grade === 'A') return 'text-success'
	if (grade === 'B+' || grade === 'B') return 'text-primary'
	if (grade === 'C') return 'text-warning'
	return 'text-destructive'
}

const sortedResults = $derived(
	[...filteredResults]
		.map((r) => ({ ...r, pct: Math.round((r.marks / r.totalMarks) * 100) }))
		.sort((a, b) => b.pct - a.pct)
		.map((r, i) => ({ ...r, rank: i + 1, grade: gradeFor(r.pct) })),
)

const resultsSummary = $derived({
	avg: sortedResults.length
		? Math.round(sortedResults.reduce((s, r) => s + r.pct, 0) / sortedResults.length)
		: 0,
	highest: sortedResults.length ? sortedResults[0].pct : 0,
	lowest: sortedResults.length ? sortedResults[sortedResults.length - 1].pct : 0,
	passRate: sortedResults.length
		? Math.round((sortedResults.filter((r) => r.pct >= 40).length / sortedResults.length) * 100)
		: 0,
})

const gradeDistribution = $derived.by(() => {
	const groups = { 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0, D: 0, F: 0 }
	for (const r of sortedResults) {
		groups[r.grade as keyof typeof groups]++
	}
	return Object.entries(groups).filter(([, v]) => v > 0)
})

const gradeBarColors: Record<string, string> = {
	'A+': 'bg-success',
	A: 'bg-emerald-500',
	'B+': 'bg-primary',
	B: 'bg-blue-400',
	C: 'bg-warning',
	D: 'bg-orange-400',
	F: 'bg-destructive',
}

// ── Class Performance data ─────────────────────────────────────
interface ClassPerf {
	class: string
	avgScore: number
	students: number
	subjects: { name: string; avg: number }[]
}

let classPerformance = $state<ClassPerf[]>([])

let selectedPerfClass = $state<string | null>(null)
const perfDetail = $derived(
	selectedPerfClass ? classPerformance.find((c) => c.class === selectedPerfClass) : null,
)

// ── Convex: Attendance tab ────────────────────────────────────────────────────
$effect(() => {
	if (activeTab !== 'attendance') return
	const sectionId = attendanceClass === 'all' ? undefined : attendanceClass
	const month = attendanceFrom.slice(0, 7) // "YYYY-MM"
	;(async () => {
		try {
			if (sectionId) {
				// Get attendance rate summary for the section
				const rate = await convexQuery(
					api.reports.getSectionAttendanceRate,
					{ sectionId, month },
					null,
				)
				if (rate && Array.isArray(rate.records) && rate.records.length > 0) {
					attendanceData.splice(
						0,
						attendanceData.length,
						...rate.records.map((r: any) => ({
							id: r.studentId ?? r.id,
							name: r.name ?? '',
							rollNo: r.rollNumber ?? r.rollNo ?? '',
							class: r.class ?? sectionId,
							present: r.present ?? 0,
							absent: r.absent ?? 0,
							late: r.late ?? 0,
							total: r.total ?? (r.present ?? 0) + (r.absent ?? 0) + (r.late ?? 0),
						})),
					)
				}
			}
		} catch {
			// Convex load failed; empty state shown
		}
	})()
})

// ── Convex: Exam Results tab ──────────────────────────────────────────────────
$effect(() => {
	if (activeTab !== 'results') return
	const classId = resultsClass === 'all' ? undefined : resultsClass
	;(async () => {
		try {
			if (classId) {
				const averages = await convexQuery(api.reports.getClassTestAverages, { classId }, null)
				// averages returns subject averages; update examResults if student-level data included
				if (averages && Array.isArray(averages.students) && averages.students.length > 0) {
					examResults.splice(
						0,
						examResults.length,
						...averages.students.map((s: any) => ({
							id: s.studentId ?? s.id,
							name: s.name ?? '',
							rollNo: s.rollNumber ?? s.rollNo ?? '',
							class: classId,
							marks: Math.round(s.averagePercent ?? 0),
							totalMarks: 100,
						})),
					)
				}
			}
		} catch {
			// Convex load failed; empty state shown
		}
	})()
})

// ── Convex: Class Performance tab ─────────────────────────────────────────────
$effect(() => {
	if (activeTab !== 'performance') return
	;(async () => {
		try {
			const perfResults = await Promise.all(
				classPerformance.map(async (cls) => {
					const progress = await convexQuery(
						api.progress.getSectionProgress,
						{ sectionId: cls.class },
						null,
					)
					return { cls, progress }
				}),
			)
			const updated = perfResults
				.filter(({ progress }) => Array.isArray(progress) && progress.length > 0)
				.map(({ cls, progress }) => {
					const arr = progress as any[]
					const avgAttendance =
						arr.reduce((s: number, r: any) => s + (r.attendancePercent ?? 0), 0) / arr.length
					const avgTest =
						arr.reduce((s: number, r: any) => s + (r.testAveragePercent ?? 0), 0) / arr.length
					const avgScore = Math.round((avgAttendance + avgTest) / 2)
					return {
						...cls,
						students: arr.length,
						avgScore,
					}
				})
			if (updated.length > 0) {
				for (const u of updated) {
					const idx = classPerformance.findIndex((c) => c.class === u.class)
					if (idx !== -1) {
						classPerformance[idx] = { ...classPerformance[idx], ...u }
					}
				}
			}
		} catch {
			// Convex load failed; empty state shown
		}
	})()
})

function barColor(avg: number): string {
	if (avg >= 80) return 'bg-success'
	if (avg >= 70) return 'bg-primary'
	if (avg >= 60) return 'bg-warning'
	return 'bg-destructive'
}
</script>

<div class="flex flex-col gap-6 p-6">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-bold tracking-tight">{t('nav.reports')}</h1>
    <p class="text-sm text-muted-foreground">{t('reports.attendance')}, {t('reports.examResults').toLowerCase()}, {t('reports.classPerformance').toLowerCase()}</p>
  </div>

  <!-- Tab Bar -->
  <div class="flex gap-1 rounded-lg border border-border bg-muted/40 p-1 w-fit">
    {#each ([['attendance', t('reports.attendance')], ['results', t('reports.examResults')], ['performance', t('reports.classPerformance')]] as const) as [key, label]}
      <Button
        onclick={() => (activeTab = key)}
        class="rounded-md px-4 py-1.5 text-sm font-medium transition-colors {activeTab === key
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'}"
      >
        {label}
      </Button>
    {/each}
  </div>

  <!-- ── Attendance Tab ── -->
  {#if activeTab === 'attendance'}
    <div class="flex flex-col gap-5">
      <!-- Filters -->
      <Card>
        <CardContent class="flex flex-wrap items-end gap-4 p-4">
          <div class="flex flex-col gap-1.5">
            <Label for="att-from">From</Label>
            <Input id="att-from" type="date" bind:value={attendanceFrom} class="w-40" />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="att-to">To</Label>
            <Input id="att-to" type="date" bind:value={attendanceTo} class="w-40" />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="att-class">Class / Section</Label>
            <Select
              id="att-class"
              bind:value={attendanceClass}
              class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All Classes</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
            </Select>
          </div>
          <Button variant="outline" size="sm">{t('common.export')}</Button>
        </CardContent>
      </Card>

      <!-- Summary cards -->
      <div class="grid grid-cols-4 gap-4">
        <Card>
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Users class="h-4 w-4 text-primary" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Total Students</p>
              <p class="text-xl font-bold">{attendanceSummary.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-success/10">
              <CheckCircle class="h-4 w-4 text-success" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">{t('reports.present')} %</p>
              <p class="text-xl font-bold text-success">{attendanceSummary.presentPct}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10">
              <XCircle class="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">{t('reports.absent')} %</p>
              <p class="text-xl font-bold text-destructive">{attendanceSummary.absentPct}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-warning/10">
              <Clock class="h-4 w-4 text-warning" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">{t('reports.late')} %</p>
              <p class="text-xl font-bold text-warning">{attendanceSummary.latePct}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Visual bar -->
      <Card>
        <CardHeader><CardTitle class="text-base">{t('reports.attendanceDistribution')}</CardTitle></CardHeader>
        <CardContent class="flex flex-col gap-3 pb-5">
          <div class="flex h-8 w-full overflow-hidden rounded-lg">
            <div
              class="flex items-center justify-center bg-success text-xs font-medium text-white transition-all"
              style="width: {attendanceSummary.presentPct}%"
            >
              {attendanceSummary.presentPct > 10 ? `${attendanceSummary.presentPct}%` : ''}
            </div>
            <div
              class="flex items-center justify-center bg-warning text-xs font-medium text-white transition-all"
              style="width: {attendanceSummary.latePct}%"
            >
              {attendanceSummary.latePct > 5 ? `${attendanceSummary.latePct}%` : ''}
            </div>
            <div
              class="flex items-center justify-center bg-destructive text-xs font-medium text-white transition-all"
              style="width: {attendanceSummary.absentPct}%"
            >
              {attendanceSummary.absentPct > 5 ? `${attendanceSummary.absentPct}%` : ''}
            </div>
          </div>
          <div class="flex gap-5 text-xs text-muted-foreground">
            <span class="flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded-sm bg-success"></span>{t('reports.present')}</span>
            <span class="flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded-sm bg-warning"></span>{t('reports.late')}</span>
            <span class="flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded-sm bg-destructive"></span>{t('reports.absent')}</span>
          </div>
        </CardContent>
      </Card>

      <!-- Per-student table -->
      <Card>
        <CardHeader><CardTitle class="text-base">{t('reports.perStudentAttendance')}</CardTitle></CardHeader>
        <CardContent class="p-0">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-muted/40">
                <th class="px-4 py-3 text-left font-medium text-muted-foreground">Roll No</th>
                <th class="px-4 py-3 text-left font-medium text-muted-foreground">{t('common.name')}</th>
                <th class="px-4 py-3 text-left font-medium text-muted-foreground">Class</th>
                <th class="px-4 py-3 text-center font-medium text-muted-foreground">{t('reports.present')}</th>
                <th class="px-4 py-3 text-center font-medium text-muted-foreground">{t('reports.absent')}</th>
                <th class="px-4 py-3 text-center font-medium text-muted-foreground">{t('reports.late')}</th>
                <th class="px-4 py-3 text-center font-medium text-muted-foreground">{t('reports.percentage')}</th>
              </tr>
            </thead>
            <tbody>
              {#each filteredAttendance as rec (rec.id)}
                {@const pct = Math.round((rec.present / rec.total) * 100)}
                <tr class="border-b border-border/50 hover:bg-muted/20">
                  <td class="px-4 py-2.5 font-mono text-xs text-muted-foreground">{rec.rollNo}</td>
                  <td class="px-4 py-2.5 font-medium">{rec.name}</td>
                  <td class="px-4 py-2.5 text-muted-foreground">{rec.class}</td>
                  <td class="px-4 py-2.5 text-center text-success">{rec.present}</td>
                  <td class="px-4 py-2.5 text-center text-destructive">{rec.absent}</td>
                  <td class="px-4 py-2.5 text-center text-warning">{rec.late}</td>
                  <td class="px-4 py-2.5 text-center">
                    <Badge variant={pct >= 75 ? 'success' : pct >= 50 ? 'warning' : 'destructive'}>
                      {pct}%
                    </Badge>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  {/if}

  <!-- ── Exam Results Tab ── -->
  {#if activeTab === 'results'}
    <div class="flex flex-col gap-5">
      <!-- Filters -->
      <Card>
        <CardContent class="flex flex-wrap items-end gap-4 p-4">
          <div class="flex flex-col gap-1.5">
            <Label for="exam-sel">Exam</Label>
            <Select
              id="exam-sel"
              bind:value={selectedExam}
              class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="midterm-2026">Midterm 2026</option>
              <option value="terminal-2025">Terminal 2025</option>
              <option value="final-2025">Final Exam 2025</option>
            </Select>
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="res-class">Class</Label>
            <Select
              id="res-class"
              bind:value={resultsClass}
              class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All Classes</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
            </Select>
          </div>
          <Button variant="outline" size="sm">{t('common.export')}</Button>
        </CardContent>
      </Card>

      <!-- Summary cards -->
      <div class="grid grid-cols-4 gap-4">
        <Card>
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp class="h-4 w-4 text-primary" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">{t('reports.average')} Score</p>
              <p class="text-xl font-bold">{resultsSummary.avg}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-success/10">
              <Award class="h-4 w-4 text-success" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">{t('reports.highest')}</p>
              <p class="text-xl font-bold text-success">{resultsSummary.highest}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10">
              <BarChart2 class="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">{t('reports.lowest')}</p>
              <p class="text-xl font-bold text-destructive">{resultsSummary.lowest}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-success/10">
              <CheckCircle class="h-4 w-4 text-success" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">{t('reports.passRate')}</p>
              <p class="text-xl font-bold">{resultsSummary.passRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Grade distribution visual -->
      <Card>
        <CardHeader><CardTitle class="text-base">{t('reports.gradeDistribution')}</CardTitle></CardHeader>
        <CardContent class="flex flex-col gap-3 pb-5">
          {#each gradeDistribution as entry}
            {@const grade = entry[0]}
            {@const count = entry[1]}
            <div class="flex items-center gap-3">
              <span class="w-6 text-center text-xs font-bold">{grade}</span>
              <div class="flex-1 overflow-hidden rounded-full bg-muted h-5">
                <div
                  class="h-full rounded-full transition-all {gradeBarColors[grade] ?? 'bg-primary'}"
                  style="width: {(count / sortedResults.length) * 100}%"
                ></div>
              </div>
              <span class="w-6 text-right text-xs text-muted-foreground">{count}</span>
            </div>
          {/each}
        </CardContent>
      </Card>

      <!-- Results table -->
      <Card>
        <CardHeader><CardTitle class="text-base">{t('reports.resultsTable')}</CardTitle></CardHeader>
        <CardContent class="p-0">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-muted/40">
                <th class="px-4 py-3 text-center font-medium text-muted-foreground">Rank</th>
                <th class="px-4 py-3 text-left font-medium text-muted-foreground">{t('common.name')}</th>
                <th class="px-4 py-3 text-left font-medium text-muted-foreground">Roll No</th>
                <th class="px-4 py-3 text-center font-medium text-muted-foreground">Marks</th>
                <th class="px-4 py-3 text-center font-medium text-muted-foreground">{t('reports.percentage')}</th>
                <th class="px-4 py-3 text-center font-medium text-muted-foreground">Grade</th>
              </tr>
            </thead>
            <tbody>
              {#each sortedResults as res (res.id)}
                <tr class="border-b border-border/50 hover:bg-muted/20">
                  <td class="px-4 py-2.5 text-center">
                    {#if res.rank <= 3}
                      <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-warning/20 text-xs font-bold text-warning">
                        {res.rank}
                      </span>
                    {:else}
                      <span class="text-xs text-muted-foreground">{res.rank}</span>
                    {/if}
                  </td>
                  <td class="px-4 py-2.5 font-medium">{res.name}</td>
                  <td class="px-4 py-2.5 font-mono text-xs text-muted-foreground">{res.rollNo}</td>
                  <td class="px-4 py-2.5 text-center">{res.marks}/{res.totalMarks}</td>
                  <td class="px-4 py-2.5 text-center">{res.pct}%</td>
                  <td class="px-4 py-2.5 text-center">
                    <span class="font-bold {gradeColor(res.grade)}">{res.grade}</span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  {/if}

  <!-- ── Class Performance Tab ── -->
  {#if activeTab === 'performance'}
    <div class="flex flex-col gap-5">
      <!-- Class cards grid -->
      <div class="grid grid-cols-3 gap-4 xl:grid-cols-5">
        {#each classPerformance as cls}
          <Button
            onclick={() => (selectedPerfClass = selectedPerfClass === cls.class ? null : cls.class)}
            class="rounded-xl border text-left transition-all {selectedPerfClass === cls.class
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-border bg-card shadow-sm hover:border-primary/50 hover:shadow-md'}"
          >
            <div class="p-4">
              <p class="font-semibold">{cls.class}</p>
              <p class="text-xs text-muted-foreground">{cls.students} students</p>
              <div class="mt-3 flex items-end gap-1">
                <span class="text-2xl font-bold">{cls.avgScore}</span>
                <span class="mb-1 text-sm text-muted-foreground">/ 100</span>
              </div>
              <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  class="h-full rounded-full transition-all {barColor(cls.avgScore)}"
                  style="width: {cls.avgScore}%"
                ></div>
              </div>
            </div>
          </Button>
        {/each}
      </div>

      <!-- Subject breakdown for selected class -->
      {#if perfDetail}
        <Card>
          <CardHeader>
            <CardTitle class="text-base">
              {perfDetail.class} — Subject-wise Performance
            </CardTitle>
          </CardHeader>
          <CardContent class="flex flex-col gap-4 pb-5">
            {#each perfDetail.subjects as subj}
              <div class="flex flex-col gap-1">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium">{subj.name}</span>
                  <span class="text-muted-foreground">{subj.avg}%</span>
                </div>
                <div class="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    class="h-full rounded-full transition-all {barColor(subj.avg)}"
                    style="width: {subj.avg}%"
                  ></div>
                </div>
              </div>
            {/each}
          </CardContent>
        </Card>
      {:else}
        <!-- All classes subject comparison -->
        <Card>
          <CardHeader><CardTitle class="text-base">{t('reports.allClassComparison')}</CardTitle></CardHeader>
          <CardContent class="flex flex-col gap-4 pb-5">
            {#each classPerformance as cls}
              <div class="flex items-center gap-3">
                <span class="w-20 text-sm font-medium">{cls.class}</span>
                <div class="flex-1 overflow-hidden rounded-full bg-muted h-5">
                  <div
                    class="h-full rounded-full transition-all {barColor(cls.avgScore)}"
                    style="width: {cls.avgScore}%"
                  ></div>
                </div>
                <span class="w-12 text-right text-sm font-semibold">{cls.avgScore}%</span>
              </div>
            {/each}
            <p class="mt-2 text-xs text-muted-foreground">Click a class card above to see subject breakdown.</p>
          </CardContent>
        </Card>
      {/if}

      <!-- Legend -->
      <div class="flex gap-5 text-xs text-muted-foreground">
        <span class="flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded-sm bg-success"></span>Excellent (≥80%)</span>
        <span class="flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded-sm bg-primary"></span>Good (70–79%)</span>
        <span class="flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded-sm bg-warning"></span>Average (60–69%)</span>
        <span class="flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded-sm bg-destructive"></span>Below Average (&lt;60%)</span>
      </div>
    </div>
  {/if}
</div>
