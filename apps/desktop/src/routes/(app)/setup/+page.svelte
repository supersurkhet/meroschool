<script lang="ts">
  import { goto } from '$app/navigation';
  import { t } from '$lib/i18n/index.svelte';
  import { setSchool } from '$lib/stores/school.svelte';
  import { convexMutation, isConvexConfigured, api } from '$lib/convex';
  import Button from '$lib/components/ui/button/Button.svelte';
  import Input from '$lib/components/ui/input/Input.svelte';
  import Card from '$lib/components/ui/card/Card.svelte';
  import CardHeader from '$lib/components/ui/card/CardHeader.svelte';
  import CardTitle from '$lib/components/ui/card/CardTitle.svelte';
  import CardContent from '$lib/components/ui/card/CardContent.svelte';
  import CardFooter from '$lib/components/ui/card/CardFooter.svelte';
  import Badge from '$lib/components/ui/badge/Badge.svelte';
  import Label from '$lib/components/ui/label/Label.svelte';
  import Separator from '$lib/components/ui/separator/Separator.svelte';

  // ─── Step state ───────────────────────────────────────────────────────────
  let currentStep = $state(1);
  const TOTAL_STEPS = 4;

  // ─── Convex IDs (populated as wizard progresses) ──────────────────────────
  let convexSchoolId = $state<string | null>(null);
  // Map local class id → Convex class id
  let convexClassIds = $state<Record<string, string>>({});

  // ─── Step 1: School Info ──────────────────────────────────────────────────
  let schoolName = $state('');
  let schoolAddress = $state('');
  let schoolPhone = $state('');
  let schoolEmail = $state('');
  let establishedYear = $state('');
  let logoPreview = $state<string | null>(null);
  let step1Errors = $state<Record<string, string>>({});
  let isDraggingLogo = $state(false);

  function validateStep1(): boolean {
    const errors: Record<string, string> = {};
    if (!schoolName.trim()) errors.schoolName = 'School name is required';
    if (schoolEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schoolEmail)) errors.schoolEmail = 'Invalid email address';
    step1Errors = errors;
    return Object.keys(errors).length === 0;
  }

  function handleLogoDrop(e: DragEvent) {
    e.preventDefault();
    isDraggingLogo = false;
    const file = e.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => { logoPreview = ev.target?.result as string; };
      reader.readAsDataURL(file);
    }
  }

  function handleLogoInput(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => { logoPreview = ev.target?.result as string; };
      reader.readAsDataURL(file);
    }
  }

  // ─── Step 2: Academic Year & Classes ─────────────────────────────────────
  type ClassEntry = { id: string; name: string; grade: number };

  const ACADEMIC_YEARS = [
    '2081/82', '2082/83', '2083/84', '2080/81', '2079/80'
  ];
  let selectedYear = $state('2081/82');
  let newClassName = $state('');
  let newClassGrade = $state<number | ''>('');
  let classes = $state<ClassEntry[]>([]);
  let classError = $state('');

  function addClass() {
    if (!newClassName.trim()) { classError = 'Class name is required'; return; }
    if (newClassGrade === '' || Number(newClassGrade) < 1 || Number(newClassGrade) > 12) {
      classError = 'Grade must be between 1 and 12';
      return;
    }
    classError = '';
    const localId = crypto.randomUUID();
    const name = newClassName.trim();
    const grade = Number(newClassGrade);
    classes = [...classes, { id: localId, name, grade }];
    newClassName = '';
    newClassGrade = '';

    // Convex: create class if school was persisted
    if (isConvexConfigured() && convexSchoolId) {
      convexMutation(api.schools.createClass, { schoolId: convexSchoolId, name, grade })
        .then((convexId: string) => {
          convexClassIds = { ...convexClassIds, [localId]: convexId };
        })
        .catch(() => { /* silently ignore — local state is source of truth */ });
    }
  }

  function deleteClass(id: string) {
    classes = classes.filter(c => c.id !== id);
    sections = sections.filter(s => s.classId !== id);
    subjects = subjects.filter(s => s.classId !== id);
  }

  // ─── Step 3: Sections ─────────────────────────────────────────────────────
  type SectionEntry = { id: string; classId: string; name: string };

  let sections = $state<SectionEntry[]>([]);
  let expandedClasses = $state<Set<string>>(new Set());
  let newSectionNames = $state<Record<string, string>>({});

  function toggleExpand(classId: string) {
    const next = new Set(expandedClasses);
    if (next.has(classId)) next.delete(classId);
    else next.add(classId);
    expandedClasses = next;
  }

  function addSection(classId: string, name?: string) {
    const sectionName = name ?? newSectionNames[classId];
    if (!sectionName?.trim()) return;
    const trimmed = sectionName.trim().toUpperCase();
    const alreadyExists = sections.some(s => s.classId === classId && s.name === trimmed);
    if (alreadyExists) return;
    sections = [...sections, { id: crypto.randomUUID(), classId, name: trimmed }];
    newSectionNames = { ...newSectionNames, [classId]: '' };

    // Convex: create section using resolved Convex class id
    const convexClassId = convexClassIds[classId];
    if (isConvexConfigured() && convexClassId) {
      convexMutation(api.schools.createSection, { classId: convexClassId, name: trimmed })
        .catch(() => { /* silently ignore */ });
    }
  }

  function deleteSection(id: string) {
    sections = sections.filter(s => s.id !== id);
  }

  function sectionsForClass(classId: string): SectionEntry[] {
    return sections.filter(s => s.classId === classId);
  }

  // ─── Step 4: Subjects ─────────────────────────────────────────────────────
  type SubjectEntry = { id: string; classId: string; name: string; code: string };

  const COMMON_SUBJECTS = [
    { name: 'Mathematics', code: 'MATH' },
    { name: 'Science', code: 'SCI' },
    { name: 'English', code: 'ENG' },
    { name: 'Nepali', code: 'NEP' },
    { name: 'Social Studies', code: 'SOC' },
    { name: 'Computer Science', code: 'CS' },
    { name: 'Health & PE', code: 'HPE' },
  ];

  let subjects = $state<SubjectEntry[]>([]);
  let newSubjectNames = $state<Record<string, string>>({});
  let newSubjectCodes = $state<Record<string, string>>({});
  let expandedSubjectClasses = $state<Set<string>>(new Set());

  function toggleSubjectExpand(classId: string) {
    const next = new Set(expandedSubjectClasses);
    if (next.has(classId)) next.delete(classId);
    else next.add(classId);
    expandedSubjectClasses = next;
  }

  function autoGenerateCode(name: string): string {
    return name.trim().slice(0, 3).toUpperCase();
  }

  function addSubject(classId: string, name?: string, code?: string) {
    const subjectName = name ?? newSubjectNames[classId];
    const subjectCode = code ?? newSubjectCodes[classId];
    if (!subjectName?.trim()) return;
    const trimmedName = subjectName.trim();
    const trimmedCode = (subjectCode ?? '').trim().toUpperCase() || autoGenerateCode(trimmedName);
    subjects = [
      ...subjects,
      { id: crypto.randomUUID(), classId, name: trimmedName, code: trimmedCode }
    ];
    newSubjectNames = { ...newSubjectNames, [classId]: '' };
    newSubjectCodes = { ...newSubjectCodes, [classId]: '' };

    // Convex: create subject using resolved Convex class id
    const convexClassId = convexClassIds[classId];
    if (isConvexConfigured() && convexClassId) {
      convexMutation(api.academics.createSubject, { classId: convexClassId, name: trimmedName, code: trimmedCode })
        .catch(() => { /* silently ignore */ });
    }
  }

  function deleteSubject(id: string) {
    subjects = subjects.filter(s => s.id !== id);
  }

  function subjectsForClass(classId: string): SubjectEntry[] {
    return subjects.filter(s => s.classId === classId);
  }

  function subjectAlreadyAdded(classId: string, subjectName: string): boolean {
    return subjects.some(s => s.classId === classId && s.name === subjectName);
  }

  // ─── Navigation ───────────────────────────────────────────────────────────
  function goNext() {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      // Expand all classes by default in step 3
      expandedClasses = new Set(classes.map(c => c.id));
      expandedSubjectClasses = new Set(classes.map(c => c.id));

      // Convex: persist the school and capture the returned id
      if (isConvexConfigured()) {
        convexMutation(api.schools.create, {
          name: schoolName.trim(),
          address: schoolAddress.trim(),
          phone: schoolPhone.trim(),
          email: schoolEmail.trim(),
          establishedYear: establishedYear.trim(),
          academicYear: selectedYear,
        })
          .then((id: string) => { convexSchoolId = id; })
          .catch(() => { /* silently ignore — wizard continues with local state */ });
      }
    }
    if (currentStep === 2 && classes.length === 0) {
      classError = 'Please add at least one class before proceeding';
      return;
    }
    classError = '';
    if (currentStep < TOTAL_STEPS) currentStep++;
  }

  function goBack() {
    if (currentStep > 1) currentStep--;
  }

  function finish() {
    setSchool({
      id: convexSchoolId ?? crypto.randomUUID(),
      name: schoolName,
      academicYear: selectedYear,
      address: schoolAddress,
      setupCompletedAt: new Date().toISOString(),
    });
    goto('/dashboard');
  }

  const stepLabels = ['School Info', 'Academic Year & Classes', 'Sections', 'Subjects'];
</script>

<div class="min-h-screen bg-background p-6">
  <!-- Page header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-foreground">{t('setup.schoolSetup')}</h1>
    <p class="text-muted-foreground mt-1">Configure your school step by step to get started</p>
  </div>

  <!-- Step indicator -->
  <div class="mb-8">
    <div class="flex items-center gap-0">
      {#each stepLabels as label, i}
        {@const stepNum = i + 1}
        {@const isCompleted = stepNum < currentStep}
        {@const isActive = stepNum === currentStep}
        <div class="flex items-center">
          <!-- Step circle -->
          <div class="flex flex-col items-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 {isCompleted ? 'bg-primary text-primary-foreground' : isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 'bg-muted text-muted-foreground'}">
              {#if isCompleted}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              {:else}
                {stepNum}
              {/if}
            </div>
            <span class="mt-2 text-xs font-medium {isActive ? 'text-primary' : 'text-muted-foreground'} hidden sm:block whitespace-nowrap">{label}</span>
          </div>
          <!-- Connector line -->
          {#if i < stepLabels.length - 1}
            <div class="h-0.5 w-16 sm:w-24 mx-2 mt-[-20px] transition-all duration-300 {stepNum < currentStep ? 'bg-primary' : 'bg-border'}"></div>
          {/if}
        </div>
      {/each}
    </div>
    <div class="mt-4">
      <Badge variant="secondary" class="text-xs">{t(`setup.step${currentStep}`)}</Badge>
    </div>
  </div>

  <!-- Step content -->
  <div class="max-w-3xl">

    <!-- ───── STEP 1: School Info ───── -->
    {#if currentStep === 1}
      <Card>
        <CardHeader>
          <CardTitle>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              School Information
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Logo upload -->
          <div class="space-y-2">
            <Label>School Logo <span class="text-muted-foreground text-xs">(optional)</span></Label>
            <Button
              type="button"
              class="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all duration-200 cursor-pointer w-full {isDraggingLogo ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}"
              ondrop={handleLogoDrop}
              ondragover={(e) => { e.preventDefault(); isDraggingLogo = true; }}
              ondragleave={() => { isDraggingLogo = false; }}
              onclick={() => document.getElementById('logo-input')?.click()}
              aria-label="Upload school logo"
            >
              {#if logoPreview}
                <img src={logoPreview} alt="School logo preview" class="w-24 h-24 object-cover rounded-xl shadow-md" />
                <span class="text-sm text-muted-foreground">Click or drag to change logo</span>
              {:else}
                <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="text-center">
                  <p class="text-sm font-medium text-foreground">Drop logo here or click to upload</p>
                  <p class="text-xs text-muted-foreground mt-1">PNG, JPG, SVG up to 2MB</p>
                </div>
              {/if}
            </Button>
            <input id="logo-input" type="file" accept="image/*" class="hidden" onchange={handleLogoInput} />
          </div>

          <Separator />

          <!-- School Name -->
          <div class="space-y-2">
            <Label for="school-name">{t('setup.schoolName')} <span class="text-destructive">*</span></Label>
            <Input
              id="school-name"
              placeholder="e.g. Shree Janajyoti Secondary School"
              bind:value={schoolName}
              class={step1Errors.schoolName ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {#if step1Errors.schoolName}
              <p class="text-xs text-destructive flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                {step1Errors.schoolName}
              </p>
            {/if}
          </div>

          <!-- Address -->
          <div class="space-y-2">
            <Label for="school-address">{t('setup.schoolAddress')} <span class="text-muted-foreground text-xs">(optional)</span></Label>
            <Input
              id="school-address"
              placeholder="e.g. Kathmandu, Bagmati Province, Nepal"
              bind:value={schoolAddress}
              class={step1Errors.schoolAddress ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {#if step1Errors.schoolAddress}
              <p class="text-xs text-destructive flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                {step1Errors.schoolAddress}
              </p>
            {/if}
          </div>

          <!-- Phone & Email -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="school-phone">{t('common.phone')} <span class="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                id="school-phone"
                type="tel"
                placeholder="e.g. 01-4567890"
                bind:value={schoolPhone}
                class={step1Errors.schoolPhone ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {#if step1Errors.schoolPhone}
                <p class="text-xs text-destructive">{step1Errors.schoolPhone}</p>
              {/if}
            </div>
            <div class="space-y-2">
              <Label for="school-email">{t('common.email')} <span class="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                id="school-email"
                type="email"
                placeholder="e.g. info@school.edu.np"
                bind:value={schoolEmail}
                class={step1Errors.schoolEmail ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {#if step1Errors.schoolEmail}
                <p class="text-xs text-destructive">{step1Errors.schoolEmail}</p>
              {/if}
            </div>
          </div>

          <!-- Established Year -->
          <div class="space-y-2">
            <Label for="est-year">Established Year <span class="text-muted-foreground text-xs">(optional)</span></Label>
            <Input
              id="est-year"
              placeholder="e.g. 2045 BS or 1988 AD"
              bind:value={establishedYear}
              class={step1Errors.establishedYear ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {#if step1Errors.establishedYear}
              <p class="text-xs text-destructive">{step1Errors.establishedYear}</p>
            {/if}
          </div>
        </CardContent>
        <CardFooter class="flex justify-end pt-2">
          <Button onclick={goNext} size="lg">
            {t('common.next')}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </CardFooter>
      </Card>
    {/if}

    <!-- ───── STEP 2: Academic Year & Classes ───── -->
    {#if currentStep === 2}
      <div class="space-y-6">
        <!-- Academic Year -->
        <Card>
          <CardHeader>
            <CardTitle>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                {t('setup.academicYear')}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <Label>Select Academic Year (Bikram Sambat)</Label>
              <div class="flex flex-wrap gap-2">
                {#each ACADEMIC_YEARS as year}
                  <Button
                    type="button"
                    class="px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 {selectedYear === year ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-background border-border text-foreground hover:border-primary/50 hover:bg-muted'}"
                    onclick={() => { selectedYear = year; }}
                  >
                    {year}
                  </Button>
                {/each}
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Classes -->
        <Card>
          <CardHeader>
            <CardTitle>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                {t('setup.classes')}
                {#if classes.length > 0}
                  <Badge variant="secondary">{classes.length}</Badge>
                {/if}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- Add class form -->
            <div class="flex gap-3 items-end">
              <div class="flex-1 space-y-1.5">
                <Label for="class-name">Class Name</Label>
                <Input
                  id="class-name"
                  placeholder="e.g. Class 1, Grade 5"
                  bind:value={newClassName}
                  class={classError ? 'border-destructive' : ''}
                />
              </div>
              <div class="w-28 space-y-1.5">
                <Label for="class-grade">Grade No.</Label>
                <Input
                  id="class-grade"
                  type="number"
                  placeholder="1–12"
                  bind:value={newClassGrade}
                  class={classError ? 'border-destructive' : ''}
                />
              </div>
              <Button onclick={addClass} variant="outline" class="shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                {t('setup.addClass')}
              </Button>
            </div>

            {#if classError}
              <p class="text-xs text-destructive flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                {classError}
              </p>
            {/if}

            <!-- Quick-add presets -->
            <div class="space-y-1.5">
              <p class="text-xs text-muted-foreground">Quick add:</p>
              <div class="flex flex-wrap gap-2">
                {#each [1,2,3,4,5,6,7,8,9,10] as g}
                  {@const alreadyAdded = classes.some(c => c.grade === g)}
                  <Button
                    type="button"
                    disabled={alreadyAdded}
                    class="px-3 py-1 rounded-md border text-xs font-medium transition-all {alreadyAdded ? 'opacity-40 cursor-not-allowed bg-muted' : 'hover:bg-primary hover:text-primary-foreground hover:border-primary border-border'}"
                    onclick={() => {
                      if (!alreadyAdded) {
                        newClassName = `Class ${g}`;
                        newClassGrade = g;
                        addClass();
                      }
                    }}
                  >
                    Class {g}
                  </Button>
                {/each}
              </div>
            </div>

            <!-- Class list -->
            {#if classes.length > 0}
              <Separator />
              <div class="space-y-2">
                {#each classes.sort((a, b) => a.grade - b.grade) as cls}
                  <div class="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border hover:bg-muted/60 transition-colors">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {cls.grade}
                      </div>
                      <div>
                        <p class="text-sm font-medium">{cls.name}</p>
                        <p class="text-xs text-muted-foreground">Grade {cls.grade}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onclick={() => deleteClass(cls.id)}
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="py-8 text-center text-muted-foreground">
                <svg class="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p class="text-sm">No classes added yet. Add at least one class to continue.</p>
              </div>
            {/if}
          </CardContent>
          <CardFooter class="flex justify-between pt-2">
            <Button onclick={goBack} variant="outline">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              {t('common.back')}
            </Button>
            <Button onclick={goNext} size="lg">
              {t('common.next')}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </CardFooter>
        </Card>
      </div>
    {/if}

    <!-- ───── STEP 3: Sections ───── -->
    {#if currentStep === 3}
      <Card>
        <CardHeader>
          <CardTitle>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              {t('setup.sections')}
              <Badge variant="secondary">{sections.length} total</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <p class="text-sm text-muted-foreground">Add sections (e.g. A, B, C) for each class. Click a class to expand it.</p>

          {#if classes.length === 0}
            <div class="py-8 text-center text-muted-foreground">
              <p class="text-sm">No classes found. Go back and add classes first.</p>
            </div>
          {:else}
            <div class="space-y-3">
              {#each classes.sort((a, b) => a.grade - b.grade) as cls}
                {@const classSections = sectionsForClass(cls.id)}
                {@const isOpen = expandedClasses.has(cls.id)}
                <div class="border border-border rounded-xl overflow-hidden">
                  <!-- Class header -->
                  <Button
                    type="button"
                    class="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors text-left"
                    onclick={() => toggleExpand(cls.id)}
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {cls.grade}
                      </div>
                      <div>
                        <p class="font-medium text-sm">{cls.name}</p>
                        <p class="text-xs text-muted-foreground">{classSections.length} section{classSections.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      {#each classSections as sec}
                        <Badge variant="outline" class="text-xs">{sec.name}</Badge>
                      {/each}
                      <svg class="w-4 h-4 text-muted-foreground transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </Button>

                  <!-- Section content -->
                  {#if isOpen}
                    <div class="border-t border-border p-4 bg-muted/20 space-y-4">
                      <!-- Quick add buttons -->
                      <div class="space-y-1.5">
                        <p class="text-xs text-muted-foreground font-medium">Quick add sections:</p>
                        <div class="flex flex-wrap gap-2">
                          {#each ['A', 'B', 'C', 'D', 'E', 'F'] as letter}
                            {@const alreadyHas = classSections.some(s => s.name === letter)}
                            <Button
                              type="button"
                              disabled={alreadyHas}
                              class="w-9 h-9 rounded-lg border text-sm font-semibold transition-all {alreadyHas ? 'opacity-40 cursor-not-allowed bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-primary hover:text-primary-foreground hover:border-primary'}"
                              onclick={() => addSection(cls.id, letter)}
                            >
                              {letter}
                            </Button>
                          {/each}
                        </div>
                      </div>

                      <!-- Custom section input -->
                      <div class="flex gap-2">
                        <Input
                          placeholder="Custom section name"
                          bind:value={newSectionNames[cls.id]}
                          class="max-w-xs"
                        />
                        <Button variant="outline" size="sm" onclick={() => addSection(cls.id)}>
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Add
                        </Button>
                      </div>

                      <!-- Section chips -->
                      {#if classSections.length > 0}
                        <div class="flex flex-wrap gap-2">
                          {#each classSections as sec}
                            <div class="flex items-center gap-1.5 px-3 py-1.5 bg-background rounded-lg border border-border shadow-sm">
                              <span class="text-sm font-medium">{cls.name} – {sec.name}</span>
                              <Button
                                type="button"
                                class="text-muted-foreground hover:text-destructive transition-colors"
                                onclick={() => deleteSection(sec.id)}
                                aria-label="Delete section {sec.name}"
                              >
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </Button>
                            </div>
                          {/each}
                        </div>
                      {:else}
                        <p class="text-xs text-muted-foreground italic">No sections added yet for this class.</p>
                      {/if}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </CardContent>
        <CardFooter class="flex justify-between pt-2">
          <Button onclick={goBack} variant="outline">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {t('common.back')}
          </Button>
          <Button onclick={goNext} size="lg">
            {t('common.next')}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </CardFooter>
      </Card>
    {/if}

    <!-- ───── STEP 4: Subjects ───── -->
    {#if currentStep === 4}
      <Card>
        <CardHeader>
          <CardTitle>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              {t('setup.subjects')}
              <Badge variant="secondary">{subjects.length} total</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <p class="text-sm text-muted-foreground">Add subjects for each class. You can use common subject templates or enter custom ones.</p>

          {#if classes.length === 0}
            <div class="py-8 text-center text-muted-foreground">
              <p class="text-sm">No classes found. Go back and add classes first.</p>
            </div>
          {:else}
            <div class="space-y-3">
              {#each classes.sort((a, b) => a.grade - b.grade) as cls}
                {@const classSubjects = subjectsForClass(cls.id)}
                {@const isOpen = expandedSubjectClasses.has(cls.id)}
                <div class="border border-border rounded-xl overflow-hidden">
                  <!-- Class header -->
                  <Button
                    type="button"
                    class="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors text-left"
                    onclick={() => toggleSubjectExpand(cls.id)}
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {cls.grade}
                      </div>
                      <div>
                        <p class="font-medium text-sm">{cls.name}</p>
                        <p class="text-xs text-muted-foreground">{classSubjects.length} subject{classSubjects.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-muted-foreground transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </Button>

                  {#if isOpen}
                    <div class="border-t border-border p-4 bg-muted/20 space-y-4">
                      <!-- Template buttons -->
                      <div class="space-y-1.5">
                        <p class="text-xs text-muted-foreground font-medium">Common subjects:</p>
                        <div class="flex flex-wrap gap-2">
                          {#each COMMON_SUBJECTS as subj}
                            {@const added = subjectAlreadyAdded(cls.id, subj.name)}
                            <Button
                              type="button"
                              disabled={added}
                              class="px-3 py-1.5 rounded-lg border text-xs font-medium transition-all {added ? 'opacity-40 cursor-not-allowed bg-primary/10 border-primary text-primary' : 'border-border hover:bg-primary hover:text-primary-foreground hover:border-primary'}"
                              onclick={() => addSubject(cls.id, subj.name, subj.code)}
                            >
                              {#if added}✓ {/if}{subj.name}
                            </Button>
                          {/each}
                        </div>
                      </div>

                      <!-- Custom subject form -->
                      <div class="flex gap-2 items-end">
                        <div class="flex-1 space-y-1.5">
                          <Label class="text-xs">Subject Name</Label>
                          <Input
                            placeholder="e.g. Optional Mathematics"
                            bind:value={newSubjectNames[cls.id]}
                          />
                        </div>
                        <div class="w-28 space-y-1.5">
                          <Label class="text-xs">Code <span class="text-muted-foreground">(auto)</span></Label>
                          <Input
                            placeholder={newSubjectNames[cls.id] ? autoGenerateCode(newSubjectNames[cls.id]) : 'e.g. OPT'}
                            bind:value={newSubjectCodes[cls.id]}
                          />
                        </div>
                        <Button variant="outline" size="sm" onclick={() => addSubject(cls.id)}>
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Add
                        </Button>
                      </div>

                      <!-- Subject list -->
                      {#if classSubjects.length > 0}
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {#each classSubjects as subj}
                            <div class="flex items-center justify-between px-3 py-2 bg-background rounded-lg border border-border shadow-sm">
                              <div>
                                <span class="text-sm font-medium">{subj.name}</span>
                                {#if subj.code}
                                  <Badge variant="secondary" class="ml-2 text-xs">{subj.code}</Badge>
                                {/if}
                              </div>
                              <Button
                                type="button"
                                class="text-muted-foreground hover:text-destructive transition-colors"
                                onclick={() => deleteSubject(subj.id)}
                                aria-label="Delete subject {subj.name}"
                              >
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </Button>
                            </div>
                          {/each}
                        </div>
                      {:else}
                        <p class="text-xs text-muted-foreground italic">No subjects added yet for this class.</p>
                      {/if}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </CardContent>
        <CardFooter class="flex justify-between pt-2">
          <Button onclick={goBack} variant="outline">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {t('common.back')}
          </Button>
          <Button onclick={finish} size="lg" class="gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {t('common.finish')} Setup
          </Button>
        </CardFooter>
      </Card>
    {/if}
  </div>
</div>
