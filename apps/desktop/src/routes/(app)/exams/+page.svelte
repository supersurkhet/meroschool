<script lang="ts">
  import { t } from '$lib/i18n/index.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';
  import { Label } from '$lib/components/ui/label';
  import { Separator } from '$lib/components/ui/separator';
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  } from '$lib/components/ui/card';
  import { convexQuery, convexMutation, isConvexConfigured, api } from '$lib/convex';
  import { getSchool } from '$lib/stores/school.svelte';

  // ── Types ────────────────────────────────────────────────────────────────────
  type ExamEntry = {
    id: number;
    examType: string;
    className: string;
    subject: string;
    date: string;
    startTime: string;
    endTime: string;
    totalMarks: number;
    subjectColor: string;
  };

  type NewEntryDraft = {
    subject: string;
    date: string;
    startTime: string;
    endTime: string;
    totalMarks: string;
  };

  // ── Constants ────────────────────────────────────────────────────────────────
  const EXAM_TYPES = ['First Term', 'Mid Term', 'Final'];

  const CLASSES = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  ];

  const CLASS_SUBJECTS: Record<string, string[]> = {
    'Class 1': ['English', 'Nepali', 'Mathematics', 'Environmental Science'],
    'Class 2': ['English', 'Nepali', 'Mathematics', 'Environmental Science'],
    'Class 3': ['English', 'Nepali', 'Mathematics', 'Science', 'Social Studies'],
    'Class 4': ['English', 'Nepali', 'Mathematics', 'Science', 'Social Studies'],
    'Class 5': ['English', 'Nepali', 'Mathematics', 'Science', 'Social Studies'],
    'Class 6': ['English', 'Nepali', 'Mathematics', 'Science', 'Social Studies', 'Computer Science'],
    'Class 7': ['English', 'Nepali', 'Mathematics', 'Science', 'Social Studies', 'Computer Science'],
    'Class 8': ['English', 'Nepali', 'Mathematics', 'Science', 'Social Studies', 'Computer Science'],
    'Class 9': ['English', 'Nepali', 'Mathematics', 'Science', 'Social Studies', 'Computer Science', 'Optional Mathematics'],
    'Class 10': ['English', 'Nepali', 'Mathematics', 'Science', 'Social Studies', 'Computer Science', 'Optional Mathematics'],
  };

  const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    'English':               { bg: 'bg-blue-50 dark:bg-blue-900/20',    text: 'text-blue-700 dark:text-blue-300',    border: 'border-blue-200 dark:border-blue-700',   dot: 'bg-blue-500' },
    'Nepali':                { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-700', dot: 'bg-emerald-500' },
    'Mathematics':           { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-700', dot: 'bg-violet-500' },
    'Science':               { bg: 'bg-cyan-50 dark:bg-cyan-900/20',     text: 'text-cyan-700 dark:text-cyan-300',    border: 'border-cyan-200 dark:border-cyan-700',   dot: 'bg-cyan-500' },
    'Social Studies':        { bg: 'bg-amber-50 dark:bg-amber-900/20',   text: 'text-amber-700 dark:text-amber-300',  border: 'border-amber-200 dark:border-amber-700', dot: 'bg-amber-500' },
    'Computer Science':      { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-700', dot: 'bg-indigo-500' },
    'Optional Mathematics':  { bg: 'bg-rose-50 dark:bg-rose-900/20',     text: 'text-rose-700 dark:text-rose-300',    border: 'border-rose-200 dark:border-rose-700',   dot: 'bg-rose-500' },
    'Environmental Science': { bg: 'bg-green-50 dark:bg-green-900/20',   text: 'text-green-700 dark:text-green-300',  border: 'border-green-200 dark:border-green-700', dot: 'bg-green-500' },
  };

  const DEFAULT_COLOR = { bg: 'bg-secondary', text: 'text-secondary-foreground', border: 'border-border', dot: 'bg-muted-foreground' };

  function subjectColor(subject: string) {
    return SUBJECT_COLORS[subject] ?? DEFAULT_COLOR;
  }

  // ── Convex state ─────────────────────────────────────────────────────────────
  // Convex IDs for the currently selected class; populated after hierarchy loads
  let convexClassId = $state<string | null>(null);
  let convexSubjectIds = $state<Record<string, string>>({}); // subject name → convex id
  let convexSchoolId = $state<string | null>(null);

  let exams = $state<ExamEntry[]>([]);

  // ── UI State ─────────────────────────────────────────────────────────────────
  let activeExamType = $state<string>('First Term');
  let selectedClass = $state<string>('Class 10');
  let showCreateForm = $state(false);

  // Form
  let formExamType = $state('First Term');
  let formClass = $state('Class 10');
  let formEntries = $state<NewEntryDraft[]>([]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  let filteredExams = $derived(
    exams
      .filter(e => e.examType === activeExamType && e.className === selectedClass)
      .sort((a, b) => a.date.localeCompare(b.date))
  );

  let availableClasses = $derived(
    [...new Set(exams.filter(e => e.examType === activeExamType).map(e => e.className))]
  );

  let formSubjects = $derived(CLASS_SUBJECTS[formClass] ?? []);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function calcDuration(start: string, end: string): string {
    if (!start || !end) return '—';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const totalMin = (eh * 60 + em) - (sh * 60 + sm);
    if (totalMin <= 0) return '—';
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    });
  }

  function formatTime(t: string): string {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  function openCreateForm() {
    formExamType = activeExamType;
    formClass = selectedClass;
    initFormEntries();
    showCreateForm = true;
  }

  function initFormEntries() {
    const subjects = CLASS_SUBJECTS[formClass] ?? [];
    formEntries = subjects.map(subject => ({
      subject,
      date: '',
      startTime: '10:00',
      endTime: '13:00',
      totalMarks: '100',
    }));
  }

  function cancelCreate() {
    showCreateForm = false;
    formEntries = [];
  }

  async function saveExamSchedule() {
    const validEntries = formEntries.filter(e => e.date);
    if (validEntries.length === 0) return;

    const newEntries: ExamEntry[] = validEntries.map((e, i) => ({
      id: Date.now() + i,
      examType: formExamType,
      className: formClass,
      subject: e.subject,
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
      totalMarks: parseInt(e.totalMarks) || 100,
      subjectColor: '',
    }));

    // Remove old entries for same examType + class, then add new (local fallback)
    exams = [
      ...exams.filter(e => !(e.examType === formExamType && e.className === formClass)),
      ...newEntries,
    ];

    // Persist to Convex if configured
    if (isConvexConfigured()) {
      for (const entry of validEntries) {
        const subjectId = convexSubjectIds[entry.subject];
        if (!subjectId) continue;
        const durationMinutes =
          (() => {
            const [sh, sm] = entry.startTime.split(':').map(Number);
            const [eh, em] = entry.endTime.split(':').map(Number);
            return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
          })();
        try {
          await convexMutation(api.tests.createTest, {
            subjectId,
            title: `${formExamType} — ${entry.subject}`,
            durationMinutes,
            totalMarks: parseInt(entry.totalMarks) || 100,
            createdBy: 'admin',
            description: `${formClass} ${formExamType} scheduled on ${entry.date}`,
          });
        } catch (err) {
          console.warn('[exams] createTest failed for', entry.subject, err);
        }
      }
    }

    activeExamType = formExamType;
    selectedClass = formClass;
    showCreateForm = false;
    formEntries = [];
  }

  function deleteEntry(id: number) {
    exams = exams.filter(e => e.id !== id);
  }

  // When formClass changes in the form, re-init entries
  $effect(() => {
    if (showCreateForm) {
      initFormEntries();
    }
  });

  // Ensure selectedClass is valid when exam type changes
  $effect(() => {
    if (!availableClasses.includes(selectedClass) && availableClasses.length > 0) {
      selectedClass = availableClasses[0];
    }
  });

  // ── Convex: load school hierarchy + subjects + tests on mount ─────────────────
  $effect(() => {
    if (!isConvexConfigured()) return;
    const schoolId = getSchool()?.id;
    if (!schoolId) return;

    (async () => {
      // 1. Load school hierarchy to get real class/section IDs
      const hierarchy = await convexQuery(api.schools.getSchoolHierarchy, { schoolId }, null as any);
      if (hierarchy?.schoolId) convexSchoolId = hierarchy.schoolId;

      // 2. Load classes
      const convexClasses = await convexQuery(api.schools.listClasses, { schoolId: hierarchy?.schoolId ?? schoolId }, [] as any[]);

      // 3. For each class, load subjects and tests, map into ExamEntry[]
      const convexEntries: ExamEntry[] = [];
      const newSubjectIds: Record<string, string> = {};

      for (const cls of (convexClasses ?? [])) {
        const subjects = await convexQuery(
          api.academics.listSubjectsByClass,
          { classId: cls._id },
          [] as any[]
        );

        for (const subject of (subjects ?? [])) {
          const tests = await convexQuery(
            api.tests.listTestsBySubject,
            { subjectId: subject._id },
            [] as any[]
          );

          newSubjectIds[subject.name] = subject._id;

          for (const test of (tests ?? [])) {
            convexEntries.push({
              id: test._id,
              examType: test.title?.includes('Mid') ? 'Mid Term' : test.title?.includes('Final') ? 'Final' : 'First Term',
              className: cls.name,
              subject: subject.name,
              date: test.scheduledDate ?? '',
              startTime: test.startTime ?? '10:00',
              endTime: test.endTime ?? '13:00',
              totalMarks: test.totalMarks ?? 100,
              subjectColor: '',
            });
          }
        }

        // Track the convex class ID for the currently selected class
        if (cls.name === selectedClass) {
          convexClassId = cls._id;
        }
      }

      if (convexEntries.length > 0) {
        exams = convexEntries;
      }
      convexSubjectIds = newSubjectIds;
    })();
  });
</script>

<div class="min-h-screen bg-background p-6">
  <!-- Page Header -->
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-foreground">{t('exams.schedule')}</h1>
      <p class="text-sm text-muted-foreground mt-0.5">{t('exams.manageByTerm')}</p>
    </div>
    <Button onclick={openCreateForm} class="gap-2 shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M5 12h14M12 5v14"/>
      </svg>
      {t('exams.createExam')}
    </Button>
  </div>

  <!-- Create Form -->
  {#if showCreateForm}
    <div class="mb-8">
      <Card class="border-2 border-primary/20 shadow-lg">
        <CardHeader class="pb-4">
          <CardTitle class="text-lg">{t('exams.createExam')}</CardTitle>
          <CardDescription>Set dates and times for each subject in the selected class</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Exam type + class selectors -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <Label for="cf-type">Exam Type</Label>
              <select
                id="cf-type"
                bind:value={formExamType}
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {#each EXAM_TYPES as type}
                  <option value={type}>{type} Examination</option>
                {/each}
              </select>
            </div>
            <div class="space-y-1.5">
              <Label for="cf-class">Class</Label>
              <select
                id="cf-class"
                bind:value={formClass}
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {#each CLASSES as cls}
                  <option value={cls}>{cls}</option>
                {/each}
              </select>
            </div>
          </div>

          <Separator />

          <!-- Subject schedule table -->
          <div>
            <h3 class="mb-3 text-sm font-semibold text-foreground">Subject Schedule</h3>
            <div class="overflow-x-auto rounded-lg border border-border">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-border bg-muted/50">
                    <th class="px-4 py-3 text-left font-medium text-muted-foreground">Subject</th>
                    <th class="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                    <th class="px-4 py-3 text-left font-medium text-muted-foreground">Start Time</th>
                    <th class="px-4 py-3 text-left font-medium text-muted-foreground">End Time</th>
                    <th class="px-4 py-3 text-left font-medium text-muted-foreground">Total Marks</th>
                    <th class="px-4 py-3 text-left font-medium text-muted-foreground">Duration</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  {#each formEntries as entry, i}
                    {@const color = subjectColor(entry.subject)}
                    <tr class="hover:bg-muted/30 transition-colors">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                          <div class={`h-2 w-2 rounded-full ${color.dot}`}></div>
                          <span class="font-medium">{entry.subject}</span>
                        </div>
                      </td>
                      <td class="px-4 py-3">
                        <Input
                          type="date"
                          bind:value={formEntries[i].date}
                          class="h-8 w-40 text-xs"
                        />
                      </td>
                      <td class="px-4 py-3">
                        <Input
                          type="time"
                          bind:value={formEntries[i].startTime}
                          class="h-8 w-28 text-xs"
                        />
                      </td>
                      <td class="px-4 py-3">
                        <Input
                          type="time"
                          bind:value={formEntries[i].endTime}
                          class="h-8 w-28 text-xs"
                        />
                      </td>
                      <td class="px-4 py-3">
                        <Input
                          type="number"
                          bind:value={formEntries[i].totalMarks}
                          class="h-8 w-20 text-xs"
                          min="0"
                          max="200"
                        />
                      </td>
                      <td class="px-4 py-3 text-muted-foreground">
                        {calcDuration(entry.startTime, entry.endTime)}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            <p class="mt-2 text-xs text-muted-foreground">Leave date empty to skip a subject. Existing entries for this class will be replaced.</p>
          </div>
        </CardContent>
        <CardFooter class="flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onclick={cancelCreate}>{t('common.cancel')}</Button>
          <Button onclick={saveExamSchedule} disabled={formEntries.every(e => !e.date)}>
            {t('exams.saveSchedule')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  {/if}

  <!-- Exam Type Tabs -->
  <div class="mb-6">
    <div class="flex gap-1 rounded-xl border border-border bg-muted/50 p-1 w-fit">
      {#each EXAM_TYPES as type}
        <button
          type="button"
          onclick={() => { activeExamType = type; }}
          class={[
            'rounded-lg px-4 py-2 text-sm font-medium transition-all',
            activeExamType === type
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
          ].join(' ')}
        >
          {type}
        </button>
      {/each}
    </div>
  </div>

  <!-- Class selector -->
  <div class="mb-6 flex items-center gap-3">
    <Label for="class-filter" class="shrink-0 text-sm text-muted-foreground">View class:</Label>
    <div class="flex flex-wrap gap-2">
      {#each CLASSES as cls}
        {@const hasExams = exams.some(e => e.examType === activeExamType && e.className === cls)}
        <button
          type="button"
          onclick={() => { selectedClass = cls; }}
          class={[
            'rounded-full border px-3 py-1 text-xs font-medium transition-all',
            selectedClass === cls
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : hasExams
                ? 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent'
                : 'border-border/50 bg-background text-muted-foreground/60 hover:border-border hover:text-muted-foreground',
          ].join(' ')}
        >
          {cls}
          {#if !hasExams}
            <span class="ml-1 text-[10px] opacity-60">–</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <!-- Timetable -->
  {#if filteredExams.length === 0}
    <div class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-20 text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
        </svg>
      </div>
      <p class="text-base font-medium text-foreground">{t('exams.noExamSchedule')}</p>
      <p class="mt-1 text-sm text-muted-foreground">
        No {activeExamType} exams scheduled for {selectedClass} yet.
      </p>
      <Button class="mt-4" onclick={openCreateForm}>{t('exams.createExam')}</Button>
    </div>
  {:else}
    <div>
      <!-- Header -->
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-foreground">{activeExamType} Examination</h2>
          <p class="text-sm text-muted-foreground">{selectedClass} · {filteredExams.length} subjects scheduled</p>
        </div>
        <Badge variant="outline" class="text-xs font-normal">
          {filteredExams.length} exams
        </Badge>
      </div>

      <!-- Cards layout for exam entries -->
      <div class="space-y-3">
        {#each filteredExams as exam, idx (exam.id)}
          {@const color = subjectColor(exam.subject)}
          <div class={`group relative rounded-xl border ${color.border} ${color.bg} overflow-hidden transition-all duration-200 hover:shadow-md`}>
            <!-- Day number indicator -->
            <div class="absolute left-0 top-0 bottom-0 w-1 {color.dot.replace('bg-', 'bg-')}"></div>

            <div class="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
              <!-- Day + Date -->
              <div class="flex items-center gap-4 sm:w-48">
                <div class="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-current/20 bg-white/60 dark:bg-black/20 text-center shadow-sm">
                  <span class="text-[10px] font-semibold uppercase tracking-wider {color.text} opacity-70">
                    {new Date(exam.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span class="text-xl font-bold leading-none {color.text}">
                    {new Date(exam.date).getDate()}
                  </span>
                  <span class="text-[10px] font-medium {color.text} opacity-70">
                    {new Date(exam.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">
                    {new Date(exam.date).toLocaleDateString('en-US', { year: 'numeric' })}
                  </p>
                </div>
              </div>

              <!-- Subject -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <div class={`h-2.5 w-2.5 rounded-full ${color.dot}`}></div>
                  <h3 class={`text-base font-semibold ${color.text}`}>{exam.subject}</h3>
                </div>
                <p class="mt-0.5 text-xs text-muted-foreground">{selectedClass}</p>
              </div>

              <!-- Time info -->
              <div class="flex flex-wrap items-center gap-4 sm:gap-6">
                <div class="text-center">
                  <p class="text-xs text-muted-foreground">Start</p>
                  <p class="text-sm font-semibold text-foreground">{formatTime(exam.startTime)}</p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-muted-foreground">End</p>
                  <p class="text-sm font-semibold text-foreground">{formatTime(exam.endTime)}</p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-muted-foreground">Duration</p>
                  <p class="text-sm font-semibold text-foreground">{calcDuration(exam.startTime, exam.endTime)}</p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-muted-foreground">Total Marks</p>
                  <p class="text-sm font-bold {color.text}">{exam.totalMarks}</p>
                </div>
              </div>

              <!-- Delete -->
              <Button
                variant="ghost"
                size="sm"
                class="h-8 w-8 p-0 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                onclick={() => deleteEntry(exam.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                </svg>
                <span class="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        {/each}
      </div>

      <!-- Summary table -->
      <div class="mt-8">
        <h3 class="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Quick Overview</h3>
        <div class="overflow-hidden rounded-xl border border-border">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-muted/50">
                <th class="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                <th class="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th class="px-4 py-3 text-left font-medium text-muted-foreground">Subject</th>
                <th class="px-4 py-3 text-left font-medium text-muted-foreground">Time</th>
                <th class="px-4 py-3 text-left font-medium text-muted-foreground">Duration</th>
                <th class="px-4 py-3 text-right font-medium text-muted-foreground">Marks</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#each filteredExams as exam, idx (exam.id)}
                {@const color = subjectColor(exam.subject)}
                <tr class="hover:bg-muted/30 transition-colors">
                  <td class="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                  <td class="px-4 py-3 font-medium">{formatDate(exam.date)}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class={`h-2 w-2 rounded-full ${color.dot}`}></div>
                      <span>{exam.subject}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-muted-foreground">
                    {formatTime(exam.startTime)} – {formatTime(exam.endTime)}
                  </td>
                  <td class="px-4 py-3 text-muted-foreground">{calcDuration(exam.startTime, exam.endTime)}</td>
                  <td class="px-4 py-3 text-right">
                    <Badge variant="outline" class="font-semibold">{exam.totalMarks}</Badge>
                  </td>
                </tr>
              {/each}
            </tbody>
            <tfoot>
              <tr class="border-t border-border bg-muted/30">
                <td colspan="5" class="px-4 py-3 text-sm font-semibold text-foreground">Total Marks</td>
                <td class="px-4 py-3 text-right">
                  <Badge class="font-bold">{filteredExams.reduce((s, e) => s + e.totalMarks, 0)}</Badge>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  {/if}
</div>
