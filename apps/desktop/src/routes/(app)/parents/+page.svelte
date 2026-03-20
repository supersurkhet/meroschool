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
  type Student = {
    id: number;
    name: string;
    rollNumber: string;
    class: string;
    section: string;
  };

  type Parent = {
    id: number;
    name: string;
    email: string;
    phone: string;
    occupation: string;
    address: string;
    childIds: number[];
    initials: string;
    avatarColor: string;
  };

  // ── Sample students pool (for linking) ───────────────────────────────────────
  const STUDENTS: Student[] = [
    { id: 101, name: 'Aarav Sharma', rollNumber: 'R001', class: 'Class 9', section: 'A' },
    { id: 102, name: 'Priya Sharma', rollNumber: 'R002', class: 'Class 7', section: 'B' },
    { id: 103, name: 'Arjun Thapa', rollNumber: 'R003', class: 'Class 10', section: 'A' },
    { id: 104, name: 'Nisha Rai', rollNumber: 'R004', class: 'Class 8', section: 'A' },
    { id: 105, name: 'Sajan Gurung', rollNumber: 'R005', class: 'Class 5', section: 'C' },
    { id: 106, name: 'Anita Maharjan', rollNumber: 'R006', class: 'Class 6', section: 'B' },
    { id: 107, name: 'Rohan Basnet', rollNumber: 'R007', class: 'Class 3', section: 'A' },
    { id: 108, name: 'Kritika Shrestha', rollNumber: 'R008', class: 'Class 4', section: 'A' },
  ];

  const AVATAR_COLORS = [
    'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
    'bg-pink-500', 'bg-sky-500', 'bg-lime-600',
  ];

  function makeInitials(name: string) {
    return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  }

  function getStudent(id: number): Student | undefined {
    return STUDENTS.find(s => s.id === id);
  }

  // ── State ────────────────────────────────────────────────────────────────────
  let parents = $state<Parent[]>([
    {
      id: 1,
      name: 'Raj Kumar Sharma',
      email: 'raj.sharma@gmail.com',
      phone: '9841-111222',
      occupation: 'Engineer',
      address: 'Kathmandu, Baneshwor',
      childIds: [101, 102],
      initials: 'RK',
      avatarColor: 'bg-indigo-500',
    },
    {
      id: 2,
      name: 'Meena Thapa',
      email: 'meena.thapa@yahoo.com',
      phone: '9851-222333',
      occupation: 'Teacher',
      address: 'Lalitpur, Pulchowk',
      childIds: [103],
      initials: 'MT',
      avatarColor: 'bg-teal-500',
    },
    {
      id: 3,
      name: 'Gyanendra Rai',
      email: 'gyan.rai@gmail.com',
      phone: '9861-333444',
      occupation: 'Businessman',
      address: 'Bhaktapur, Suryabinayak',
      childIds: [104],
      initials: 'GR',
      avatarColor: 'bg-orange-500',
    },
    {
      id: 4,
      name: 'Sunita Gurung',
      email: 'sunita.gurung@gmail.com',
      phone: '9801-444555',
      occupation: 'Doctor',
      address: 'Kathmandu, Baluwatar',
      childIds: [105, 106],
      initials: 'SG',
      avatarColor: 'bg-pink-500',
    },
  ]);

  // UI state
  let searchQuery = $state('');
  let showAddForm = $state(false);
  let linkingParentId = $state<number | null>(null);
  let linkSearchQuery = $state('');
  let editingId = $state<number | null>(null);

  // Form fields
  let formName = $state('');
  let formEmail = $state('');
  let formPhone = $state('');
  let formOccupation = $state('');
  let formAddress = $state('');
  let formChildIds = $state<number[]>([]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  let filteredParents = $derived(
    parents.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.occupation.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  let linkingParent = $derived(
    linkingParentId !== null ? (parents.find(p => p.id === linkingParentId) ?? null) : null
  );

  // Non-null version for use inside the dialog (only rendered when linkingParent !== null)
  let linkingParentSafe = $derived(linkingParent as Parent);

  let linkSearchResults = $derived(
    linkSearchQuery.trim().length === 0
      ? STUDENTS
      : STUDENTS.filter(s =>
          s.name.toLowerCase().includes(linkSearchQuery.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(linkSearchQuery.toLowerCase())
        )
  );

  // ── Actions ──────────────────────────────────────────────────────────────────
  function resetForm() {
    formName = '';
    formEmail = '';
    formPhone = '';
    formOccupation = '';
    formAddress = '';
    formChildIds = [];
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

  function startEdit(parent: Parent) {
    editingId = parent.id;
    formName = parent.name;
    formEmail = parent.email;
    formPhone = parent.phone;
    formOccupation = parent.occupation;
    formAddress = parent.address;
    formChildIds = [...parent.childIds];
    showAddForm = true;
  }

  function saveParent() {
    if (!formName.trim() || !formEmail.trim()) return;

    if (editingId !== null) {
      const idx = parents.findIndex(p => p.id === editingId);
      if (idx !== -1) {
        parents[idx] = {
          ...parents[idx],
          name: formName,
          email: formEmail,
          phone: formPhone,
          occupation: formOccupation,
          address: formAddress,
          childIds: [...formChildIds],
          initials: makeInitials(formName),
        };
      }
    } else {
      const colorIdx = parents.length % AVATAR_COLORS.length;
      parents = [
        ...parents,
        {
          id: Date.now(),
          name: formName,
          email: formEmail,
          phone: formPhone,
          occupation: formOccupation,
          address: formAddress,
          childIds: [...formChildIds],
          initials: makeInitials(formName),
          avatarColor: AVATAR_COLORS[colorIdx],
        },
      ];
    }

    showAddForm = false;
    resetForm();
  }

  function deleteParent(id: number) {
    parents = parents.filter(p => p.id !== id);
  }

  function openLinkDialog(parentId: number) {
    linkingParentId = parentId;
    linkSearchQuery = '';
  }

  function closeLinkDialog() {
    linkingParentId = null;
    linkSearchQuery = '';
  }

  function linkStudent(parentId: number, studentId: number) {
    const idx = parents.findIndex(p => p.id === parentId);
    if (idx !== -1 && !parents[idx].childIds.includes(studentId)) {
      parents[idx] = {
        ...parents[idx],
        childIds: [...parents[idx].childIds, studentId],
      };
    }
  }

  function unlinkStudent(parentId: number, studentId: number) {
    const idx = parents.findIndex(p => p.id === parentId);
    if (idx !== -1) {
      parents[idx] = {
        ...parents[idx],
        childIds: parents[idx].childIds.filter(id => id !== studentId),
      };
    }
  }

  function toggleFormChild(studentId: number) {
    if (formChildIds.includes(studentId)) {
      formChildIds = formChildIds.filter(id => id !== studentId);
    } else {
      formChildIds = [...formChildIds, studentId];
    }
  }
</script>

<div class="min-h-screen bg-background p-6">
  <!-- Page Header -->
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-foreground">{t('parents.linking')}</h1>
      <p class="text-sm text-muted-foreground mt-0.5">{t('parents.manageContacts')}</p>
    </div>
    <Button onclick={openAddForm} class="gap-2 shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M5 12h14M12 5v14"/>
      </svg>
      {t('parents.addParent')}
    </Button>
  </div>

  <!-- Search -->
  <div class="mb-6 relative">
    <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
    <Input
      type="search"
      placeholder="Search by name, email, phone or occupation…"
      bind:value={searchQuery}
      class="pl-9 max-w-md"
    />
  </div>

  <!-- Add / Edit Form -->
  {#if showAddForm}
    <div class="mb-8">
      <Card class="border-2 border-primary/20 shadow-lg">
        <CardHeader class="pb-4">
          <CardTitle class="text-lg">
            {editingId !== null ? t('parents.editParent') : t('parents.addParent')}
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Row 1 -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <Label for="pf-name">{t('common.name')} <span class="text-destructive">*</span></Label>
              <Input id="pf-name" placeholder="e.g. Raj Kumar Sharma" bind:value={formName} />
            </div>
            <div class="space-y-1.5">
              <Label for="pf-email">{t('common.email')} <span class="text-destructive">*</span></Label>
              <Input id="pf-email" type="email" placeholder="parent@gmail.com" bind:value={formEmail} />
            </div>
          </div>

          <!-- Row 2 -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <Label for="pf-phone">{t('common.phone')}</Label>
              <Input id="pf-phone" placeholder="98XX-XXXXXX" bind:value={formPhone} />
            </div>
            <div class="space-y-1.5">
              <Label for="pf-occ">{t('parents.occupation')}</Label>
              <Input id="pf-occ" placeholder="e.g. Engineer" bind:value={formOccupation} />
            </div>
          </div>

          <!-- Address -->
          <div class="space-y-1.5">
            <Label for="pf-addr">{t('common.address')}</Label>
            <Input id="pf-addr" placeholder="City, Area" bind:value={formAddress} />
          </div>

          <Separator />

          <!-- Link children -->
          <div class="space-y-3">
            <Label>{t('parents.linkChildren')}</Label>
            <p class="text-xs text-muted-foreground">{t('parents.selectStudents')}</p>
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {#each STUDENTS as student}
                <button
                  type="button"
                  onclick={() => toggleFormChild(student.id)}
                  class={[
                    'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all',
                    formChildIds.includes(student.id)
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-background hover:border-primary/40 hover:bg-accent/50',
                  ].join(' ')}
                >
                  <div class={[
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                    formChildIds.includes(student.id)
                      ? 'border-primary bg-primary'
                      : 'border-input',
                  ].join(' ')}>
                    {#if formChildIds.includes(student.id)}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    {/if}
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium truncate">{student.name}</p>
                    <p class="text-xs text-muted-foreground">{student.class} {student.section} · Roll {student.rollNumber}</p>
                  </div>
                </button>
              {/each}
            </div>
          </div>
        </CardContent>
        <CardFooter class="flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onclick={cancelForm}>{t('common.cancel')}</Button>
          <Button
            onclick={saveParent}
            disabled={!formName.trim() || !formEmail.trim()}
          >
            {editingId !== null ? t('parents.updateParent') : t('common.save')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  {/if}

  <!-- Parents List -->
  {#if filteredParents.length === 0}
    <div class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-20 text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <p class="text-base font-medium text-foreground">{t('parents.noParentsFound')}</p>
      <p class="mt-1 text-sm text-muted-foreground">
        {searchQuery ? 'Try a different search term.' : 'Add your first parent record to get started.'}
      </p>
      {#if !searchQuery}
        <Button class="mt-4" onclick={openAddForm}>{t('parents.addParent')}</Button>
      {/if}
    </div>
  {:else}
    <div class="space-y-4">
      {#each filteredParents as parent (parent.id)}
        <Card class="group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent class="p-5">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
              <!-- Avatar + basic info -->
              <div class="flex items-start gap-4 flex-1 min-w-0">
                <div class={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${parent.avatarColor} text-white text-sm font-bold shadow-sm`}>
                  {parent.initials}
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="font-semibold text-foreground truncate">{parent.name}</h3>
                  <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span class="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                      {parent.email}
                    </span>
                    {#if parent.phone}
                      <span class="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.49 2 2 0 0 1 3.6 1.29h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.55a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        {parent.phone}
                      </span>
                    {/if}
                    {#if parent.occupation}
                      <Badge variant="secondary" class="text-xs">{parent.occupation}</Badge>
                    {/if}
                    {#if parent.address}
                      <span class="flex items-center gap-1 text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {parent.address}
                      </span>
                    {/if}
                  </div>

                  <!-- Linked children -->
                  {#if parent.childIds.length > 0}
                    <div class="mt-3">
                      <p class="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('parents.children')}</p>
                      <div class="flex flex-wrap gap-2">
                        {#each parent.childIds as childId}
                          {@const student = getStudent(childId)}
                          {#if student}
                            <div class="group/chip flex items-center gap-1.5 rounded-full border border-border bg-accent/50 pl-2.5 pr-1.5 py-1">
                              <div class="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                  <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/>
                                </svg>
                              </div>
                              <span class="text-xs font-medium">{student.name}</span>
                              <span class="text-xs text-muted-foreground">{student.class} {student.section}</span>
                              <button
                                type="button"
                                onclick={() => unlinkStudent(parent.id, childId)}
                                class="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/20 hover:text-destructive group-hover/chip:opacity-100"
                                title="Unlink"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                  <path d="M18 6 6 18M6 6l12 12"/>
                                </svg>
                              </button>
                            </div>
                          {/if}
                        {/each}
                      </div>
                    </div>
                  {:else}
                    <p class="mt-2 text-xs text-muted-foreground italic">{t('parents.noChildrenLinked')}</p>
                  {/if}
                </div>
              </div>

              <!-- Actions -->
              <div class="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                <Button
                  variant="outline"
                  size="sm"
                  class="gap-1.5 text-xs"
                  onclick={() => openLinkDialog(parent.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  {t('parents.linkToStudent')}
                </Button>
                <div class="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    onclick={() => startEdit(parent)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
                    </svg>
                    <span class="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-8 w-8 p-0 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                    onclick={() => deleteParent(parent.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                    </svg>
                    <span class="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  {/if}
</div>

<!-- Link Child Dialog -->
{#if linkingParentId !== null && linkingParent !== null}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
    role="button"
    tabindex="-1"
    onclick={closeLinkDialog}
    onkeydown={(e) => e.key === 'Escape' && closeLinkDialog()}
    aria-label="Close dialog"
  ></div>

  <!-- Dialog -->
  <div class="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4">
    <Card class="shadow-2xl border-border">
      <CardHeader class="pb-3">
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="text-lg">{t('parents.linkToStudent')}</CardTitle>
            <p class="text-sm text-muted-foreground mt-0.5">Linking to: <span class="font-medium text-foreground">{linkingParentSafe.name}</span></p>
          </div>
          <Button variant="ghost" size="sm" class="h-8 w-8 p-0" onclick={closeLinkDialog}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
            <span class="sr-only">Close</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent class="space-y-4">
        <!-- Search students -->
        <div class="relative">
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <Input
            type="search"
            placeholder="Search by name or roll number…"
            bind:value={linkSearchQuery}
            class="pl-9"
          />
        </div>

        <!-- Student list -->
        <div class="max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {#if linkSearchResults.length === 0}
            <p class="py-6 text-center text-sm text-muted-foreground">No students found</p>
          {:else}
            {#each linkSearchResults as student}
              {@const isLinked = linkingParentSafe.childIds.includes(student.id)}
              <div class={[
                'flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors',
                isLinked ? 'border-success/50 bg-success/5' : 'border-border hover:bg-accent/50',
              ].join(' ')}>
                <div>
                  <p class="text-sm font-medium">{student.name}</p>
                  <p class="text-xs text-muted-foreground">{student.class} {student.section} · Roll #{student.rollNumber}</p>
                </div>
                <Button
                  variant={isLinked ? 'secondary' : 'outline'}
                  size="sm"
                  class={[
                    'h-7 text-xs gap-1',
                    isLinked ? 'text-success-foreground bg-success/20 hover:bg-destructive/10 hover:text-destructive border-0' : '',
                  ].join(' ')}
                  onclick={() => {
                    if (isLinked) {
                      unlinkStudent(linkingParentId!, student.id);
                    } else {
                      linkStudent(linkingParentId!, student.id);
                    }
                  }}
                >
                  {#if isLinked}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Linked
                  {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M5 12h14M12 5v14"/>
                    </svg>
                    Link
                  {/if}
                </Button>
              </div>
            {/each}
          {/if}
        </div>
      </CardContent>

      <CardFooter class="border-t pt-4 justify-end">
        <Button onclick={closeLinkDialog}>{t('common.close')}</Button>
      </CardFooter>
    </Card>
  </div>
{/if}
