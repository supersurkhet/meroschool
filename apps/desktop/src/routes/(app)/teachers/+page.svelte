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
    CardContent,
    CardFooter,
  } from '$lib/components/ui/card';

  // ── Types ────────────────────────────────────────────────────────────────────
  type Teacher = {
    id: number;
    name: string;
    email: string;
    phone: string;
    employeeId: string;
    department: string;
    joinDate: string;
    subjects: string[];
    classes: string[];
    initials: string;
    avatarColor: string;
  };

  // ── Sample data ──────────────────────────────────────────────────────────────
  const ALL_SUBJECTS = [
    'Mathematics', 'Science', 'English', 'Nepali',
    'Social Studies', 'Computer Science', 'Physical Education',
    'Arts', 'Music', 'Health',
  ];

  const ALL_CLASSES = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  ];

  const DEPARTMENTS = [
    'Science & Math', 'Humanities', 'Languages', 'Arts & PE', 'Technology',
  ];

  const AVATAR_COLORS = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-rose-500', 'bg-amber-500', 'bg-cyan-500',
  ];

  function makeInitials(name: string) {
    return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  }

  let teachers = $state<Teacher[]>([
    {
      id: 1,
      name: 'Ram Prasad Sharma',
      email: 'ram.sharma@meroschoool.edu.np',
      phone: '9841-123456',
      employeeId: 'EMP-001',
      department: 'Science & Math',
      joinDate: '2019-04-15',
      subjects: ['Mathematics', 'Science'],
      classes: ['Class 9', 'Class 10'],
      initials: 'RS',
      avatarColor: 'bg-violet-500',
    },
    {
      id: 2,
      name: 'Sita Devi Thapa',
      email: 'sita.thapa@meroschool.edu.np',
      phone: '9851-234567',
      employeeId: 'EMP-002',
      department: 'Languages',
      joinDate: '2020-07-01',
      subjects: ['English', 'Nepali'],
      classes: ['Class 7', 'Class 8'],
      initials: 'ST',
      avatarColor: 'bg-blue-500',
    },
    {
      id: 3,
      name: 'Bikash Kumar Rai',
      email: 'bikash.rai@meroschool.edu.np',
      phone: '9861-345678',
      employeeId: 'EMP-003',
      department: 'Technology',
      joinDate: '2021-01-10',
      subjects: ['Computer Science', 'Mathematics'],
      classes: ['Class 9', 'Class 10'],
      initials: 'BR',
      avatarColor: 'bg-emerald-500',
    },
    {
      id: 4,
      name: 'Kamala Gurung',
      email: 'kamala.gurung@meroschool.edu.np',
      phone: '9801-456789',
      employeeId: 'EMP-004',
      department: 'Humanities',
      joinDate: '2018-06-20',
      subjects: ['Social Studies', 'Nepali'],
      classes: ['Class 5', 'Class 6'],
      initials: 'KG',
      avatarColor: 'bg-rose-500',
    },
    {
      id: 5,
      name: 'Dipesh Maharjan',
      email: 'dipesh.maharjan@meroschool.edu.np',
      phone: '9811-567890',
      employeeId: 'EMP-005',
      department: 'Arts & PE',
      joinDate: '2022-03-05',
      subjects: ['Physical Education', 'Arts', 'Music'],
      classes: ['Class 1', 'Class 2', 'Class 3'],
      initials: 'DM',
      avatarColor: 'bg-amber-500',
    },
  ]);

  // ── UI state ─────────────────────────────────────────────────────────────────
  let searchQuery = $state('');
  let showAddForm = $state(false);
  let editingId = $state<number | null>(null);

  // Form fields
  let formName = $state('');
  let formEmail = $state('');
  let formPhone = $state('');
  let formEmployeeId = $state('');
  let formDepartment = $state('');
  let formJoinDate = $state('');
  let formSubjects = $state<string[]>([]);
  let formClasses = $state<string[]>([]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  let filteredTeachers = $derived(
    teachers.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // ── Actions ──────────────────────────────────────────────────────────────────
  function resetForm() {
    formName = '';
    formEmail = '';
    formPhone = '';
    formEmployeeId = '';
    formDepartment = '';
    formJoinDate = '';
    formSubjects = [];
    formClasses = [];
    editingId = null;
  }

  function openAddForm() {
    resetForm();
    showAddForm = true;
  }

  function cancelForm() {
    showAddForm = false;
    resetForm();
  }

  function startEdit(teacher: Teacher) {
    editingId = teacher.id;
    formName = teacher.name;
    formEmail = teacher.email;
    formPhone = teacher.phone;
    formEmployeeId = teacher.employeeId;
    formDepartment = teacher.department;
    formJoinDate = teacher.joinDate;
    formSubjects = [...teacher.subjects];
    formClasses = [...teacher.classes];
    showAddForm = true;
    // Scroll to form
    setTimeout(() => {
      document.getElementById('teacher-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  function saveTeacher() {
    if (!formName.trim() || !formEmail.trim() || !formEmployeeId.trim()) return;

    if (editingId !== null) {
      const idx = teachers.findIndex(t => t.id === editingId);
      if (idx !== -1) {
        teachers[idx] = {
          ...teachers[idx],
          name: formName,
          email: formEmail,
          phone: formPhone,
          employeeId: formEmployeeId,
          department: formDepartment,
          joinDate: formJoinDate,
          subjects: [...formSubjects],
          classes: [...formClasses],
          initials: makeInitials(formName),
        };
      }
    } else {
      const colorIdx = teachers.length % AVATAR_COLORS.length;
      teachers = [
        ...teachers,
        {
          id: Date.now(),
          name: formName,
          email: formEmail,
          phone: formPhone,
          employeeId: formEmployeeId,
          department: formDepartment,
          joinDate: formJoinDate,
          subjects: [...formSubjects],
          classes: [...formClasses],
          initials: makeInitials(formName),
          avatarColor: AVATAR_COLORS[colorIdx],
        },
      ];
    }

    showAddForm = false;
    resetForm();
  }

  function deleteTeacher(id: number) {
    teachers = teachers.filter(t => t.id !== id);
  }

  function toggleSubject(subject: string) {
    if (formSubjects.includes(subject)) {
      formSubjects = formSubjects.filter(s => s !== subject);
    } else {
      formSubjects = [...formSubjects, subject];
    }
  }

  function toggleClass(cls: string) {
    if (formClasses.includes(cls)) {
      formClasses = formClasses.filter(c => c !== cls);
    } else {
      formClasses = [...formClasses, cls];
    }
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }

  const DEPT_COLORS: Record<string, string> = {
    'Science & Math': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'Humanities': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'Languages': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'Arts & PE': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    'Technology': 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  };
</script>

<div class="min-h-screen bg-background p-6">
  <!-- Page Header -->
  <div class="mb-6 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground">{t('teachers.management')}</h1>
        <p class="text-sm text-muted-foreground mt-0.5">{t('teachers.manageStaff')}</p>
      </div>
      <div class="flex h-7 items-center rounded-full bg-primary/10 px-3">
        <span class="text-xs font-semibold text-primary">{teachers.length} total</span>
      </div>
    </div>
    <Button onclick={openAddForm} class="gap-2 shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M5 12h14M12 5v14"/>
      </svg>
      {t('teachers.addTeacher')}
    </Button>
  </div>

  <!-- Search Bar -->
  <div class="mb-6 relative">
    <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
    <Input
      type="search"
      placeholder="Search by name, email, ID or department…"
      bind:value={searchQuery}
      class="pl-9 max-w-md"
    />
  </div>

  <!-- Add / Edit Form -->
  {#if showAddForm}
    <div id="teacher-form" class="mb-8">
      <Card class="border-2 border-primary/20 shadow-lg">
        <CardHeader class="pb-4">
          <CardTitle class="text-lg">
            {editingId !== null ? t('teachers.editTeacher') : t('teachers.addTeacher')}
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Row 1: Name + Email -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <Label for="f-name">{t('common.name')} <span class="text-destructive">*</span></Label>
              <Input id="f-name" placeholder="e.g. Ram Prasad Sharma" bind:value={formName} />
            </div>
            <div class="space-y-1.5">
              <Label for="f-email">{t('common.email')} <span class="text-destructive">*</span></Label>
              <Input id="f-email" type="email" placeholder="teacher@school.edu.np" bind:value={formEmail} />
            </div>
          </div>

          <!-- Row 2: Phone + Employee ID -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <Label for="f-phone">{t('common.phone')}</Label>
              <Input id="f-phone" placeholder="98XX-XXXXXX" bind:value={formPhone} />
            </div>
            <div class="space-y-1.5">
              <Label for="f-empid">{t('teachers.employeeId')} <span class="text-destructive">*</span></Label>
              <Input id="f-empid" placeholder="EMP-001" bind:value={formEmployeeId} />
            </div>
          </div>

          <!-- Row 3: Department + Join Date -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <Label for="f-dept">{t('teachers.department')}</Label>
              <select
                id="f-dept"
                bind:value={formDepartment}
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select department…</option>
                {#each DEPARTMENTS as dept}
                  <option value={dept}>{dept}</option>
                {/each}
              </select>
            </div>
            <div class="space-y-1.5">
              <Label for="f-joindate">{t('teachers.joinDate')}</Label>
              <Input id="f-joindate" type="date" bind:value={formJoinDate} />
            </div>
          </div>

          <Separator />

          <!-- Subjects multi-select -->
          <div class="space-y-3">
            <Label>{t('teachers.assignSubjects')}</Label>
            <div class="flex flex-wrap gap-2">
              {#each ALL_SUBJECTS as subject}
                <button
                  type="button"
                  onclick={() => toggleSubject(subject)}
                  class={[
                    'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                    formSubjects.includes(subject)
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent',
                  ].join(' ')}
                >
                  {subject}
                </button>
              {/each}
            </div>
          </div>

          <!-- Classes multi-select -->
          <div class="space-y-3">
            <Label>{t('teachers.assignClasses')}</Label>
            <div class="flex flex-wrap gap-2">
              {#each ALL_CLASSES as cls}
                <button
                  type="button"
                  onclick={() => toggleClass(cls)}
                  class={[
                    'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                    formClasses.includes(cls)
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent',
                  ].join(' ')}
                >
                  {cls}
                </button>
              {/each}
            </div>
          </div>
        </CardContent>
        <CardFooter class="flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onclick={cancelForm}>{t('common.cancel')}</Button>
          <Button
            onclick={saveTeacher}
            disabled={!formName.trim() || !formEmail.trim() || !formEmployeeId.trim()}
          >
            {editingId !== null ? t('teachers.updateTeacher') : t('common.save')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  {/if}

  <!-- Teacher Grid -->
  {#if filteredTeachers.length === 0}
    <div class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-20 text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <p class="text-base font-medium text-foreground">{t('teachers.noTeachersFound')}</p>
      <p class="mt-1 text-sm text-muted-foreground">
        {searchQuery ? 'Try a different search term.' : 'Add your first teacher to get started.'}
      </p>
      {#if !searchQuery}
        <Button class="mt-4" onclick={openAddForm}>{t('teachers.addTeacher')}</Button>
      {/if}
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {#each filteredTeachers as teacher (teacher.id)}
        <Card class="group relative flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <!-- Colored top accent bar -->
          <div class={`h-1.5 w-full ${teacher.avatarColor} opacity-70`}></div>

          <CardContent class="flex flex-1 flex-col p-5">
            <!-- Header: Avatar + Name + IDs -->
            <div class="flex items-start gap-3">
              <div class={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${teacher.avatarColor} text-white text-base font-bold shadow-sm`}>
                {teacher.initials}
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="truncate font-semibold text-foreground">{teacher.name}</h3>
                <p class="truncate text-xs text-muted-foreground">{teacher.email}</p>
                <div class="mt-1 flex items-center gap-2">
                  <span class="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">{teacher.employeeId}</span>
                  {#if teacher.phone}
                    <span class="text-xs text-muted-foreground">{teacher.phone}</span>
                  {/if}
                </div>
              </div>
            </div>

            <Separator class="my-4" />

            <!-- Department -->
            {#if teacher.department}
              <div class="mb-3">
                <span class={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${DEPT_COLORS[teacher.department] ?? 'bg-secondary text-secondary-foreground'}`}>
                  {teacher.department}
                </span>
              </div>
            {/if}

            <!-- Subjects -->
            {#if teacher.subjects.length > 0}
              <div class="mb-3">
                <p class="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Subjects</p>
                <div class="flex flex-wrap gap-1.5">
                  {#each teacher.subjects as subject}
                    <Badge variant="secondary" class="text-xs">{subject}</Badge>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Classes -->
            {#if teacher.classes.length > 0}
              <div class="mb-3">
                <p class="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Classes</p>
                <div class="flex flex-wrap gap-1.5">
                  {#each teacher.classes as cls}
                    <Badge variant="outline" class="text-xs">{cls}</Badge>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Join date -->
            <div class="mt-auto pt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
              Joined {formatDate(teacher.joinDate)}
            </div>
          </CardContent>

          <!-- Actions -->
          <CardFooter class="border-t bg-muted/30 px-5 py-3 flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              class="gap-1.5 text-muted-foreground hover:text-foreground"
              onclick={() => startEdit(teacher)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
              </svg>
              {t('common.edit')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="gap-1.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
              onclick={() => deleteTeacher(teacher.id)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
              </svg>
              {t('common.delete')}
            </Button>
          </CardFooter>
        </Card>
      {/each}
    </div>
  {/if}
</div>
