<script lang="ts">
	import { t } from '$lib/i18n/index.svelte'
	import { onMount } from 'svelte'
	import { convexQuery, convexMutation, isConvexConfigured, api } from '$lib/convex'
	import { Button } from '$lib/components/ui/button'
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label'
	import { Badge } from '$lib/components/ui/badge'
	import {
		Plus,
		Pencil,
		Trash2,
		X,
		School,
		MapPin,
		Phone,
		Mail,
		Search,
		Loader2,
	} from 'lucide-svelte'

	// ── Types ──────────────────────────────────────────────────────────
	interface SchoolRecord {
		id: string
		name: string
		address: string
		phone: string
		email: string
	}

	// ── State ──────────────────────────────────────────────────────────
	let schools = $state<SchoolRecord[]>([
		{
			id: '1',
			name: 'Surkhet Valley Secondary School',
			address: 'Birendranagar-10, Surkhet',
			phone: '+977-083-520123',
			email: 'info@surkhetvalley.edu.np',
		},
		{
			id: '2',
			name: 'Karnali Academy',
			address: 'Birendranagar-6, Surkhet',
			phone: '+977-083-521456',
			email: 'admin@karnaliacademy.edu.np',
		},
		{
			id: '3',
			name: 'Bright Future English School',
			address: 'Lekbeshi-3, Surkhet',
			phone: '+977-083-540789',
			email: 'contact@brightfuture.edu.np',
		},
	])

	let loading = $state(true)
	let showForm = $state(false)
	let editingId = $state<string | null>(null)
	let searchQuery = $state('')

	// Form fields
	let formName = $state('')
	let formAddress = $state('')
	let formPhone = $state('')
	let formEmail = $state('')

	// ── Convex loading ────────────────────────────────────────────────
	onMount(async () => {
		if (!isConvexConfigured()) { loading = false; return }

		try {
			const convexSchools = await convexQuery(api.schools.list, {}, [] as any[])
			if (Array.isArray(convexSchools) && convexSchools.length > 0) {
				schools = convexSchools.map((s: any) => ({
					id: s._id ?? s.id,
					name: s.name ?? '',
					address: s.address ?? '',
					phone: s.phone ?? '',
					email: s.email ?? '',
				}))
			}
		} catch (err) {
			console.warn('[schools] Convex load failed, using mock data:', err)
		}
		loading = false
	})

	async function refreshFromConvex() {
		if (!isConvexConfigured()) return
		try {
			const convexSchools = await convexQuery(api.schools.list, {}, [] as any[])
			if (Array.isArray(convexSchools) && convexSchools.length > 0) {
				schools = convexSchools.map((s: any) => ({
					id: s._id ?? s.id,
					name: s.name ?? '',
					address: s.address ?? '',
					phone: s.phone ?? '',
					email: s.email ?? '',
				}))
			}
		} catch { /* keep current state */ }
	}

	let filteredSchools = $derived(
		searchQuery
			? schools.filter(
					(s) =>
						s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						s.address.toLowerCase().includes(searchQuery.toLowerCase()),
				)
			: schools,
	)

	// ── Helpers ────────────────────────────────────────────────────────
	function resetForm() {
		formName = ''
		formAddress = ''
		formPhone = ''
		formEmail = ''
		editingId = null
		showForm = false
	}

	function openAdd() {
		resetForm()
		showForm = true
	}

	function openEdit(school: SchoolRecord) {
		formName = school.name
		formAddress = school.address
		formPhone = school.phone
		formEmail = school.email
		editingId = school.id
		showForm = true
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault()
		if (editingId) {
			// Optimistic local update
			schools = schools.map((s) =>
				s.id === editingId
					? { ...s, name: formName, address: formAddress, phone: formPhone, email: formEmail }
					: s,
			)
			// Convex: persist update
			if (isConvexConfigured()) {
				try {
					await convexMutation(api.schools.update, {
						id: editingId,
						name: formName,
						address: formAddress,
						...(formPhone ? { phone: formPhone } : {}),
						...(formEmail ? { email: formEmail } : {}),
					})
				} catch (err) {
					console.warn('[schools] Convex update failed, keeping local state:', err)
				}
			}
		} else {
			const optimisticId = crypto.randomUUID()
			schools = [
				...schools,
				{
					id: optimisticId,
					name: formName,
					address: formAddress,
					phone: formPhone,
					email: formEmail,
				},
			]
			// Convex: persist creation
			if (isConvexConfigured()) {
				try {
					const realId = await convexMutation(api.schools.create, {
						name: formName,
						address: formAddress,
						...(formPhone ? { phone: formPhone } : {}),
						...(formEmail ? { email: formEmail } : {}),
					})
					schools = schools.map((s) => s.id === optimisticId ? { ...s, id: realId } : s)
				} catch (err) {
					console.warn('[schools] Convex create failed, keeping local entry:', err)
				}
			}
		}
		resetForm()
	}

	async function handleDelete(id: string) {
		schools = schools.filter((s) => s.id !== id)
		// Note: Convex schools.ts does not export a `remove` mutation.
		// If one is added later, wire it here.
	}
</script>

<div class="flex flex-col gap-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">{t('nav.schools')}</h1>
			<p class="text-sm text-muted-foreground">{t('schools.manageSchools')}</p>
		</div>
		<Button onclick={openAdd} class="gap-2">
			<Plus class="h-4 w-4" />
			{t('schools.addSchool')}
		</Button>
	</div>

	<!-- Search -->
	<div class="relative max-w-sm">
		<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
		<Input
			placeholder={t('schools.searchSchools')}
			bind:value={searchQuery}
			class="pl-9"
		/>
	</div>

	<!-- Add / Edit Form -->
	{#if showForm}
		<Card class="border-primary/30">
			<CardHeader class="pb-4">
				<div class="flex items-center justify-between">
					<CardTitle class="text-base">
						{editingId ? t('schools.editSchool') : t('schools.addNewSchool')}
					</CardTitle>
					<button
						onclick={resetForm}
						class="rounded-md p-1 text-muted-foreground hover:bg-muted"
					>
						<X class="h-4 w-4" />
					</button>
				</div>
			</CardHeader>
			<CardContent>
				<form onsubmit={handleSubmit} class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<Label class="text-xs font-medium">{t('common.name')}</Label>
						<Input
							placeholder="School name"
							bind:value={formName}
							required
						/>
					</div>
					<div class="space-y-1.5">
						<Label class="text-xs font-medium">{t('common.address')}</Label>
						<Input
							placeholder="Address"
							bind:value={formAddress}
							required
						/>
					</div>
					<div class="space-y-1.5">
						<Label class="text-xs font-medium">{t('common.phone')}</Label>
						<Input
							placeholder="+977-..."
							bind:value={formPhone}
						/>
					</div>
					<div class="space-y-1.5">
						<Label class="text-xs font-medium">{t('common.email')}</Label>
						<Input
							type="email"
							placeholder="info@school.edu.np"
							bind:value={formEmail}
						/>
					</div>
					<div class="col-span-2 flex justify-end gap-2 pt-2">
						<Button variant="outline" type="button" onclick={resetForm}>
							{t('common.cancel')}
						</Button>
						<Button type="submit">
							{editingId ? t('common.save') : t('common.add')}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	{/if}

	<!-- Schools Table -->
	{#if loading}
		<Card>
			<CardContent class="flex items-center justify-center gap-2 py-12 text-muted-foreground">
				<Loader2 class="h-5 w-5 animate-spin" />
				<span class="text-sm">Loading schools...</span>
			</CardContent>
		</Card>
	{/if}

	{#if !loading}
	<Card>
		<CardContent class="p-0">
			{#if filteredSchools.length === 0}
				<div class="flex flex-col items-center gap-3 py-12 text-muted-foreground">
					<School class="h-10 w-10 opacity-30" />
					<p class="text-sm">{t('schools.noSchoolsFound')}</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-border bg-muted/40 text-left">
								<th class="px-4 py-3 font-semibold text-muted-foreground">{t('common.name')}</th>
								<th class="px-4 py-3 font-semibold text-muted-foreground">{t('common.address')}</th>
								<th class="px-4 py-3 font-semibold text-muted-foreground">{t('common.phone')}</th>
								<th class="px-4 py-3 font-semibold text-muted-foreground">{t('common.email')}</th>
								<th class="px-4 py-3 text-right font-semibold text-muted-foreground">{t('common.actions')}</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredSchools as school (school.id)}
								<tr class="border-b border-border/50 transition-colors hover:bg-muted/20">
									<td class="px-4 py-3">
										<div class="flex items-center gap-2">
											<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
												<School class="h-4 w-4 text-primary" />
											</div>
											<span class="font-medium">{school.name}</span>
										</div>
									</td>
									<td class="px-4 py-3">
										<span class="flex items-center gap-1.5 text-muted-foreground">
											<MapPin class="h-3.5 w-3.5 shrink-0" />
											{school.address}
										</span>
									</td>
									<td class="px-4 py-3">
										<span class="flex items-center gap-1.5 text-muted-foreground">
											<Phone class="h-3.5 w-3.5 shrink-0" />
											{school.phone}
										</span>
									</td>
									<td class="px-4 py-3">
										<span class="flex items-center gap-1.5 text-muted-foreground">
											<Mail class="h-3.5 w-3.5 shrink-0" />
											{school.email}
										</span>
									</td>
									<td class="px-4 py-3 text-right">
										<div class="flex items-center justify-end gap-1">
											<button
												onclick={() => openEdit(school)}
												class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
												title={t('common.edit')}
											>
												<Pencil class="h-3.5 w-3.5" />
											</button>
											<button
												onclick={() => handleDelete(school.id)}
												class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
												title={t('common.delete')}
											>
												<Trash2 class="h-3.5 w-3.5" />
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</CardContent>
	</Card>

	{/if}

	<!-- Summary -->
	<div class="flex items-center gap-2 text-xs text-muted-foreground">
		<Badge variant="secondary">{schools.length}</Badge>
		<span>{t('schools.registered')}</span>
	</div>
</div>
