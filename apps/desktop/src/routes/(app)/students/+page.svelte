<script lang="ts">
  import { t } from '$lib/i18n/index.svelte';
  import Button from '$lib/components/ui/button/Button.svelte';
  import Input from '$lib/components/ui/input/Input.svelte';
  import Card from '$lib/components/ui/card/Card.svelte';
  import CardHeader from '$lib/components/ui/card/CardHeader.svelte';
  import CardTitle from '$lib/components/ui/card/CardTitle.svelte';
  import CardContent from '$lib/components/ui/card/CardContent.svelte';
  import Badge from '$lib/components/ui/badge/Badge.svelte';
  import Label from '$lib/components/ui/label/Label.svelte';
  import Separator from '$lib/components/ui/separator/Separator.svelte';

  // ─── Types ────────────────────────────────────────────────────────────────
  type Student = {
    id: string;
    rollNumber: string;
    name: string;
    email: string;
    classId: string;
    sectionId: string;
    dateOfBirth: string;
    admissionDate: string;
  };

  type ClassEntry = { id: string; name: string; grade: number };
  type SectionEntry = { id: string; classId: string; name: string };

  // ─── Sample class/section data ────────────────────────────────────────────
  const CLASSES: ClassEntry[] = [
    { id: 'cls1', name: 'Class 1', grade: 1 },
    { id: 'cls5', name: 'Class 5', grade: 5 },
    { id: 'cls8', name: 'Class 8', grade: 8 },
    { id: 'cls10', name: 'Class 10', grade: 10 },
  ];

  const SECTIONS: SectionEntry[] = [
    { id: 'sec1a', classId: 'cls1', name: 'A' },
    { id: 'sec1b', classId: 'cls1', name: 'B' },
    { id: 'sec5a', classId: 'cls5', name: 'A' },
    { id: 'sec5b', classId: 'cls5', name: 'B' },
    { id: 'sec8a', classId: 'cls8', name: 'A' },
    { id: 'sec10a', classId: 'cls10', name: 'A' },
    { id: 'sec10b', classId: 'cls10', name: 'B' },
    { id: 'sec10c', classId: 'cls10', name: 'C' },
  ];

  // ─── Sample student data ──────────────────────────────────────────────────
  let students = $state<Student[]>([
    { id: 's1', rollNumber: '001', name: 'Aarav Sharma', email: 'aarav.sharma@student.edu.np', classId: 'cls10', sectionId: 'sec10a', dateOfBirth: '2008-03-15', admissionDate: '2023-04-01' },
    { id: 's2', rollNumber: '002', name: 'Priya Thapa', email: 'priya.thapa@student.edu.np', classId: 'cls10', sectionId: 'sec10a', dateOfBirth: '2008-07-22', admissionDate: '2023-04-01' },
    { id: 's3', rollNumber: '003', name: 'Rohan Karki', email: 'rohan.karki@student.edu.np', classId: 'cls10', sectionId: 'sec10b', dateOfBirth: '2008-01-10', admissionDate: '2023-04-01' },
    { id: 's4', rollNumber: '101', name: 'Sita Rai', email: 'sita.rai@student.edu.np', classId: 'cls8', sectionId: 'sec8a', dateOfBirth: '2010-05-18', admissionDate: '2022-04-05' },
    { id: 's5', rollNumber: '102', name: 'Bikram Gurung', email: 'bikram.gurung@student.edu.np', classId: 'cls8', sectionId: 'sec8a', dateOfBirth: '2010-11-02', admissionDate: '2022-04-05' },
    { id: 's6', rollNumber: '201', name: 'Anisha Magar', email: 'anisha.magar@student.edu.np', classId: 'cls5', sectionId: 'sec5a', dateOfBirth: '2013-08-30', admissionDate: '2021-04-10' },
    { id: 's7', rollNumber: '202', name: 'Dipesh Bhandari', email: 'dipesh.bhandari@student.edu.np', classId: 'cls5', sectionId: 'sec5b', dateOfBirth: '2013-02-14', admissionDate: '2021-04-10' },
    { id: 's8', rollNumber: '301', name: 'Nisha Tamang', email: 'nisha.tamang@student.edu.np', classId: 'cls1', sectionId: 'sec1a', dateOfBirth: '2017-06-25', admissionDate: '2024-04-02' },
    { id: 's9', rollNumber: '302', name: 'Saroj Shrestha', email: 'saroj.shrestha@student.edu.np', classId: 'cls1', sectionId: 'sec1b', dateOfBirth: '2017-09-12', admissionDate: '2024-04-02' },
    { id: 's10', rollNumber: '004', name: 'Kabita Adhikari', email: 'kabita.adhikari@student.edu.np', classId: 'cls10', sectionId: 'sec10c', dateOfBirth: '2008-12-05', admissionDate: '2023-04-01' },
  ]);

  // ─── Filter & search state ────────────────────────────────────────────────
  let searchQuery = $state('');
  let filterClassId = $state('');
  let filterSectionId = $state('');
  let sortColumn = $state<'rollNumber' | 'name' | 'dateOfBirth'>('rollNumber');
  let sortAsc = $state(true);

  const filteredSections = $derived(
    filterClassId ? SECTIONS.filter(s => s.classId === filterClassId) : []
  );

  const filteredStudents = $derived.by(() => {
    let result = students;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.rollNumber.includes(q)
      );
    }

    if (filterClassId) result = result.filter(s => s.classId === filterClassId);
    if (filterSectionId) result = result.filter(s => s.sectionId === filterSectionId);

    return [...result].sort((a, b) => {
      const av = a[sortColumn];
      const bv = b[sortColumn];
      const cmp = av.localeCompare(bv);
      return sortAsc ? cmp : -cmp;
    });
  });

  function toggleSort(col: typeof sortColumn) {
    if (sortColumn === col) sortAsc = !sortAsc;
    else { sortColumn = col; sortAsc = true; }
  }

  function sortIcon(col: typeof sortColumn): string {
    if (sortColumn !== col) return 'none';
    return sortAsc ? 'asc' : 'desc';
  }

  function getClassName(classId: string): string {
    return CLASSES.find(c => c.id === classId)?.name ?? '—';
  }

  function getSectionName(sectionId: string): string {
    return SECTIONS.find(s => s.id === sectionId)?.name ?? '—';
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // ─── Add Student modal ────────────────────────────────────────────────────
  let showAddForm = $state(false);
  let editingStudent = $state<Student | null>(null);

  let formName = $state('');
  let formEmail = $state('');
  let formRollNumber = $state('');
  let formDob = $state('');
  let formAdmissionDate = $state('');
  let formClassId = $state('');
  let formSectionId = $state('');
  let formErrors = $state<Record<string, string>>({});

  const formSections = $derived(
    formClassId ? SECTIONS.filter(s => s.classId === formClassId) : []
  );

  function openAddForm() {
    editingStudent = null;
    formName = '';
    formEmail = '';
    formRollNumber = '';
    formDob = '';
    formAdmissionDate = new Date().toISOString().slice(0, 10);
    formClassId = '';
    formSectionId = '';
    formErrors = {};
    showAddForm = true;
  }

  function openEditForm(student: Student) {
    editingStudent = student;
    formName = student.name;
    formEmail = student.email;
    formRollNumber = student.rollNumber;
    formDob = student.dateOfBirth;
    formAdmissionDate = student.admissionDate;
    formClassId = student.classId;
    formSectionId = student.sectionId;
    formErrors = {};
    showAddForm = true;
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = 'Name is required';
    if (!formEmail.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) errors.email = 'Invalid email';
    if (!formRollNumber.trim()) errors.rollNumber = 'Roll number is required';
    if (!formDob) errors.dob = 'Date of birth is required';
    if (!formAdmissionDate) errors.admissionDate = 'Admission date is required';
    if (!formClassId) errors.classId = 'Please select a class';
    if (!formSectionId) errors.sectionId = 'Please select a section';
    formErrors = errors;
    return Object.keys(errors).length === 0;
  }

  function saveStudent() {
    if (!validateForm()) return;

    if (editingStudent) {
      students = students.map(s =>
        s.id === editingStudent!.id
          ? { ...s, name: formName, email: formEmail, rollNumber: formRollNumber, dateOfBirth: formDob, admissionDate: formAdmissionDate, classId: formClassId, sectionId: formSectionId }
          : s
      );
    } else {
      students = [
        ...students,
        {
          id: crypto.randomUUID(),
          name: formName,
          email: formEmail,
          rollNumber: formRollNumber,
          dateOfBirth: formDob,
          admissionDate: formAdmissionDate,
          classId: formClassId,
          sectionId: formSectionId,
        }
      ];
    }
    showAddForm = false;
    editingStudent = null;
  }

  function deleteStudent(id: string) {
    if (confirm('Delete this student record? This action cannot be undone.')) {
      students = students.filter(s => s.id !== id);
    }
  }

  // ─── CSV Import ───────────────────────────────────────────────────────────
  let showImport = $state(false);
  let isDraggingCsv = $state(false);
  let csvPreviewRows = $state<string[][]>([]);
  let csvHeaders = $state<string[]>([]);
  let csvFileName = $state('');
  let csvError = $state('');

  function parseCsv(text: string): string[][] {
    return text.trim().split('\n').map(line =>
      line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
    );
  }

  function handleCsvFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      csvError = 'Please upload a CSV file';
      return;
    }
    csvFileName = file.name;
    csvError = '';
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCsv(text);
      if (rows.length < 2) { csvError = 'CSV must have at least a header row and one data row'; return; }
      csvHeaders = rows[0];
      csvPreviewRows = rows.slice(1).slice(0, 10); // preview first 10 rows
    };
    reader.readAsText(file);
  }

  function handleCsvDrop(e: DragEvent) {
    e.preventDefault();
    isDraggingCsv = false;
    const file = e.dataTransfer?.files[0];
    if (file) handleCsvFile(file);
  }

  function handleCsvInput(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) handleCsvFile(file);
  }

  function importCsvStudents() {
    // Map CSV rows to students using heuristic column matching
    const nameIdx = csvHeaders.findIndex(h => /name/i.test(h));
    const emailIdx = csvHeaders.findIndex(h => /email/i.test(h));
    const rollIdx = csvHeaders.findIndex(h => /roll/i.test(h));
    const dobIdx = csvHeaders.findIndex(h => /birth|dob/i.test(h));

    const newStudents: Student[] = csvPreviewRows
      .filter(row => row.some(cell => cell.trim()))
      .map(row => ({
        id: crypto.randomUUID(),
        name: nameIdx >= 0 ? row[nameIdx] : row[0] ?? '',
        email: emailIdx >= 0 ? row[emailIdx] : '',
        rollNumber: rollIdx >= 0 ? row[rollIdx] : '',
        dateOfBirth: dobIdx >= 0 ? row[dobIdx] : '',
        admissionDate: new Date().toISOString().slice(0, 10),
        classId: CLASSES[0]?.id ?? '',
        sectionId: SECTIONS[0]?.id ?? '',
      }));

    students = [...students, ...newStudents];
    showImport = false;
    csvPreviewRows = [];
    csvHeaders = [];
    csvFileName = '';
  }

  const EXAMPLE_CSV = `Name,Email,Roll Number,Date of Birth
Ram Prasad,ram@student.edu.np,001,2008-05-20
Sita Devi,sita@student.edu.np,002,2009-01-15`;
</script>

<div class="min-h-screen bg-background p-6 space-y-6">
  <!-- ─── Page Header ─────────────────────────────────────────────────────── -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-foreground">{t('nav.students')}</h1>
        <p class="text-sm text-muted-foreground">{t('students.studentList')}</p>
      </div>
      <Badge variant="secondary" class="text-sm px-3 py-1">
        {students.length} {t('students.totalStudents')}
      </Badge>
    </div>
    <div class="flex items-center gap-2">
      <Button variant="outline" onclick={() => { showImport = !showImport; showAddForm = false; }}>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
        {t('students.importCsv')}
      </Button>
      <Button onclick={() => { openAddForm(); showImport = false; }}>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {t('students.addStudent')}
      </Button>
    </div>
  </div>

  <!-- ─── Add/Edit Student Form ──────────────────────────────────────────── -->
  {#if showAddForm}
    <Card class="border-primary/30 shadow-md">
      <CardHeader class="pb-4">
        <CardTitle class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            {editingStudent ? 'Edit Student' : t('students.addStudent')}
          </div>
          <button
            type="button"
            class="text-muted-foreground hover:text-foreground transition-colors"
            onclick={() => { showAddForm = false; editingStudent = null; }}
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-5">
        <!-- Row 1: Name & Email -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <Label for="f-name">{t('common.name')} <span class="text-destructive">*</span></Label>
            <Input id="f-name" placeholder="Full name" bind:value={formName} class={formErrors.name ? 'border-destructive' : ''} />
            {#if formErrors.name}<p class="text-xs text-destructive">{formErrors.name}</p>{/if}
          </div>
          <div class="space-y-1.5">
            <Label for="f-email">{t('common.email')} <span class="text-destructive">*</span></Label>
            <Input id="f-email" type="email" placeholder="student@school.edu.np" bind:value={formEmail} class={formErrors.email ? 'border-destructive' : ''} />
            {#if formErrors.email}<p class="text-xs text-destructive">{formErrors.email}</p>{/if}
          </div>
        </div>

        <!-- Row 2: Roll Number, DOB, Admission Date -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="space-y-1.5">
            <Label for="f-roll">{t('students.rollNumber')} <span class="text-destructive">*</span></Label>
            <Input id="f-roll" placeholder="e.g. 001" bind:value={formRollNumber} class={formErrors.rollNumber ? 'border-destructive' : ''} />
            {#if formErrors.rollNumber}<p class="text-xs text-destructive">{formErrors.rollNumber}</p>{/if}
          </div>
          <div class="space-y-1.5">
            <Label for="f-dob">{t('students.dateOfBirth')} <span class="text-destructive">*</span></Label>
            <Input id="f-dob" type="date" bind:value={formDob} class={formErrors.dob ? 'border-destructive' : ''} />
            {#if formErrors.dob}<p class="text-xs text-destructive">{formErrors.dob}</p>{/if}
          </div>
          <div class="space-y-1.5">
            <Label for="f-admission">{t('students.admissionDate')} <span class="text-destructive">*</span></Label>
            <Input id="f-admission" type="date" bind:value={formAdmissionDate} class={formErrors.admissionDate ? 'border-destructive' : ''} />
            {#if formErrors.admissionDate}<p class="text-xs text-destructive">{formErrors.admissionDate}</p>{/if}
          </div>
        </div>

        <!-- Row 3: Class & Section -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <Label for="f-class">{t('students.assignClass')} <span class="text-destructive">*</span></Label>
            <select
              id="f-class"
              bind:value={formClassId}
              onchange={() => { formSectionId = ''; }}
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring {formErrors.classId ? 'border-destructive' : ''}"
            >
              <option value="">Select a class...</option>
              {#each CLASSES as cls}
                <option value={cls.id}>{cls.name}</option>
              {/each}
            </select>
            {#if formErrors.classId}<p class="text-xs text-destructive">{formErrors.classId}</p>{/if}
          </div>
          <div class="space-y-1.5">
            <Label for="f-section">{t('students.assignSection')} <span class="text-destructive">*</span></Label>
            <select
              id="f-section"
              bind:value={formSectionId}
              disabled={!formClassId}
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 {formErrors.sectionId ? 'border-destructive' : ''}"
            >
              <option value="">{formClassId ? 'Select a section...' : 'Select class first'}</option>
              {#each formSections as sec}
                <option value={sec.id}>Section {sec.name}</option>
              {/each}
            </select>
            {#if formErrors.sectionId}<p class="text-xs text-destructive">{formErrors.sectionId}</p>{/if}
          </div>
        </div>

        <Separator />

        <div class="flex justify-end gap-2">
          <Button variant="outline" onclick={() => { showAddForm = false; editingStudent = null; }}>
            {t('common.cancel')}
          </Button>
          <Button onclick={saveStudent}>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {editingStudent ? 'Update Student' : t('common.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- ─── CSV Import Panel ────────────────────────────────────────────────── -->
  {#if showImport}
    <Card class="border-primary/30 shadow-md">
      <CardHeader class="pb-4">
        <CardTitle class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Import Students from CSV
          </div>
          <button
            type="button"
            class="text-muted-foreground hover:text-foreground transition-colors"
            onclick={() => { showImport = false; csvPreviewRows = []; csvHeaders = []; csvFileName = ''; }}
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Column hints -->
        <div class="p-3 rounded-lg bg-muted/40 border border-border text-sm space-y-1">
          <p class="font-medium text-foreground text-xs">Expected CSV columns (order flexible):</p>
          <div class="flex flex-wrap gap-2 mt-1.5">
            {#each ['Name', 'Email', 'Roll Number', 'Date of Birth'] as hint}
              <Badge variant="outline" class="text-xs font-mono">{hint}</Badge>
            {/each}
          </div>
          <details class="mt-2">
            <summary class="text-xs text-muted-foreground cursor-pointer hover:text-foreground">Show example CSV</summary>
            <pre class="mt-2 text-xs bg-background border border-border rounded p-2 overflow-x-auto">{EXAMPLE_CSV}</pre>
          </details>
        </div>

        <!-- Drop zone -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all duration-200 cursor-pointer {isDraggingCsv ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}"
          ondrop={handleCsvDrop}
          ondragover={(e) => { e.preventDefault(); isDraggingCsv = true; }}
          ondragleave={() => { isDraggingCsv = false; }}
          onclick={() => document.getElementById('csv-input')?.click()}
        >
          <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          {#if csvFileName}
            <div class="text-center">
              <p class="text-sm font-medium text-foreground">{csvFileName}</p>
              <p class="text-xs text-muted-foreground">Click or drag to replace</p>
            </div>
          {:else}
            <div class="text-center">
              <p class="text-sm font-medium text-foreground">Drop your CSV file here</p>
              <p class="text-xs text-muted-foreground">or click to browse</p>
            </div>
          {/if}
        </div>
        <input id="csv-input" type="file" accept=".csv" class="hidden" onchange={handleCsvInput} />

        {#if csvError}
          <p class="text-sm text-destructive flex items-center gap-1">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
            {csvError}
          </p>
        {/if}

        <!-- CSV Preview table -->
        {#if csvPreviewRows.length > 0}
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium">Preview ({csvPreviewRows.length} rows)</p>
              <Badge variant="secondary">{csvPreviewRows.length} student{csvPreviewRows.length !== 1 ? 's' : ''} found</Badge>
            </div>
            <div class="rounded-lg border border-border overflow-hidden overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-muted/50">
                  <tr>
                    {#each csvHeaders as header}
                      <th class="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{header}</th>
                    {/each}
                  </tr>
                </thead>
                <tbody>
                  {#each csvPreviewRows as row, i}
                    <tr class="border-t border-border {i % 2 === 0 ? '' : 'bg-muted/20'}">
                      {#each row as cell}
                        <td class="px-3 py-2 text-foreground">{cell}</td>
                      {/each}
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            <p class="text-xs text-muted-foreground">Note: Class and section will be set to defaults. Edit individual records after import.</p>
          </div>

          <div class="flex justify-end gap-2">
            <Button variant="outline" onclick={() => { csvPreviewRows = []; csvHeaders = []; csvFileName = ''; }}>
              Clear
            </Button>
            <Button onclick={importCsvStudents}>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import {csvPreviewRows.length} Students
            </Button>
          </div>
        {/if}
      </CardContent>
    </Card>
  {/if}

  <!-- ─── Filters & Search ───────────────────────────────────────────────── -->
  <Card>
    <CardContent class="pt-4 pb-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Search -->
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email or roll no..."
            bind:value={searchQuery}
            class="flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {#if searchQuery}
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onclick={() => { searchQuery = ''; }}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        </div>

        <!-- Class filter -->
        <select
          bind:value={filterClassId}
          onchange={() => { filterSectionId = ''; }}
          class="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[140px]"
        >
          <option value="">All Classes</option>
          {#each CLASSES as cls}
            <option value={cls.id}>{cls.name}</option>
          {/each}
        </select>

        <!-- Section filter -->
        <select
          bind:value={filterSectionId}
          disabled={!filterClassId}
          class="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-w-[140px]"
        >
          <option value="">All Sections</option>
          {#each filteredSections as sec}
            <option value={sec.id}>Section {sec.name}</option>
          {/each}
        </select>

        <!-- Clear filters -->
        {#if filterClassId || filterSectionId || searchQuery}
          <Button
            variant="ghost"
            size="sm"
            onclick={() => { filterClassId = ''; filterSectionId = ''; searchQuery = ''; }}
          >
            Clear filters
          </Button>
        {/if}
      </div>
    </CardContent>
  </Card>

  <!-- ─── Student Table ─────────────────────────────────────────────────── -->
  <Card class="overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-muted/50 border-b border-border">
          <tr>
            <!-- Roll No -->
            <th class="px-4 py-3 text-left">
              <button
                type="button"
                class="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
                onclick={() => toggleSort('rollNumber')}
              >
                {t('students.rollNumber')}
                <span class="ml-1">
                  {#if sortIcon('rollNumber') === 'asc'}
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                  {:else if sortIcon('rollNumber') === 'desc'}
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  {:else}
                    <svg class="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                  {/if}
                </span>
              </button>
            </th>
            <!-- Name -->
            <th class="px-4 py-3 text-left">
              <button
                type="button"
                class="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
                onclick={() => toggleSort('name')}
              >
                {t('common.name')}
                <span class="ml-1">
                  {#if sortIcon('name') === 'asc'}
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                  {:else if sortIcon('name') === 'desc'}
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  {:else}
                    <svg class="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                  {/if}
                </span>
              </button>
            </th>
            <!-- Email -->
            <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('common.email')}</th>
            <!-- Class -->
            <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('setup.classes')}</th>
            <!-- Section -->
            <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('setup.sections')}</th>
            <!-- DOB -->
            <th class="px-4 py-3 text-left">
              <button
                type="button"
                class="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
                onclick={() => toggleSort('dateOfBirth')}
              >
                {t('students.dateOfBirth')}
                <span class="ml-1">
                  {#if sortIcon('dateOfBirth') === 'asc'}
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                  {:else if sortIcon('dateOfBirth') === 'desc'}
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  {:else}
                    <svg class="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                  {/if}
                </span>
              </button>
            </th>
            <!-- Actions -->
            <th class="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          {#each filteredStudents as student, i}
            <tr class="group hover:bg-muted/30 transition-colors">
              <!-- Roll No -->
              <td class="px-4 py-3">
                <span class="font-mono text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                  #{student.rollNumber}
                </span>
              </td>
              <!-- Name + avatar -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {student.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <span class="font-medium text-foreground">{student.name}</span>
                </div>
              </td>
              <!-- Email -->
              <td class="px-4 py-3 text-muted-foreground text-sm">{student.email}</td>
              <!-- Class -->
              <td class="px-4 py-3">
                <Badge variant="secondary" class="font-normal">{getClassName(student.classId)}</Badge>
              </td>
              <!-- Section -->
              <td class="px-4 py-3">
                <div class="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-accent-foreground">
                  {getSectionName(student.sectionId)}
                </div>
              </td>
              <!-- DOB -->
              <td class="px-4 py-3 text-muted-foreground text-sm whitespace-nowrap">{formatDate(student.dateOfBirth)}</td>
              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-7 w-7 text-muted-foreground hover:text-primary"
                    onclick={() => { openEditForm(student); showImport = false; }}
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onclick={() => deleteStudent(student.id)}
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </td>
            </tr>
          {:else}
            <!-- Empty state -->
            <tr>
              <td colspan="7" class="px-4 py-16 text-center">
                <div class="flex flex-col items-center gap-3 text-muted-foreground">
                  <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <svg class="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-foreground">No students found</p>
                    <p class="text-sm mt-0.5">
                      {#if searchQuery || filterClassId || filterSectionId}
                        Try adjusting your search or filters
                      {:else}
                        Add your first student to get started
                      {/if}
                    </p>
                  </div>
                  {#if !searchQuery && !filterClassId}
                    <Button onclick={openAddForm} size="sm">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      {t('students.addStudent')}
                    </Button>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Table footer -->
    {#if filteredStudents.length > 0}
      <div class="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing {filteredStudents.length} of {students.length} students</span>
        <span>Sorted by {sortColumn === 'rollNumber' ? 'Roll No' : sortColumn === 'name' ? 'Name' : 'Date of Birth'} ({sortAsc ? 'A→Z' : 'Z→A'})</span>
      </div>
    {/if}
  </Card>
</div>
