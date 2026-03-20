<script lang="ts">
	import { t } from "$lib/i18n/index.js";
	import Button from "$lib/components/ui/button.svelte";
	import Input from "$lib/components/ui/input.svelte";
	import Select from "$lib/components/ui/select.svelte";
	import Card from "$lib/components/ui/card.svelte";
	import Badge from "$lib/components/ui/badge.svelte";

	let step = $state(1);
	let submitted = $state(false);

	// Step 2: Classes
	let classes = $state<string[]>([]);
	let newClassName = $state("");

	// Step 3: Sections
	let sections = $state<Record<string, string[]>>({});
	let newSectionInputs = $state<Record<string, string>>({});

	// Step 4: Teacher invites
	let teacherEmails = $state<string[]>([]);
	let newTeacherEmail = $state("");

	const provinces = [
		"Koshi Pradesh",
		"Madhesh Pradesh",
		"Bagmati Pradesh",
		"Gandaki Pradesh",
		"Lumbini Pradesh",
		"Karnali Pradesh",
		"Sudurpashchim Pradesh",
	];

	const steps = [
		{ num: 1, key: "onboard.step1" },
		{ num: 2, key: "onboard.step2Title" },
		{ num: 3, key: "onboard.step3Title" },
		{ num: 4, key: "onboard.step4Title" },
	];

	function nextStep() {
		if (step < 4) step++;
	}

	function prevStep() {
		if (step > 1) step--;
	}

	function handleSubmit() {
		submitted = true;
	}

	function addClass() {
		const name = newClassName.trim();
		if (name && !classes.includes(name)) {
			classes = [...classes, name];
			sections[name] = [];
			newSectionInputs[name] = "";
			newClassName = "";
		}
	}

	function removeClass(name: string) {
		classes = classes.filter((c) => c !== name);
		const { [name]: _, ...rest } = sections;
		sections = rest;
		const { [name]: __, ...restInputs } = newSectionInputs;
		newSectionInputs = restInputs;
	}

	function addSection(className: string) {
		const sectionName = (newSectionInputs[className] ?? "").trim();
		if (sectionName && !(sections[className] ?? []).includes(sectionName)) {
			sections = {
				...sections,
				[className]: [...(sections[className] ?? []), sectionName],
			};
			newSectionInputs = { ...newSectionInputs, [className]: "" };
		}
	}

	function removeSection(className: string, sectionName: string) {
		sections = {
			...sections,
			[className]: (sections[className] ?? []).filter((s) => s !== sectionName),
		};
	}

	function addTeacher() {
		const email = newTeacherEmail.trim();
		if (email && !teacherEmails.includes(email)) {
			teacherEmails = [...teacherEmails, email];
			newTeacherEmail = "";
		}
	}

	function removeTeacher(email: string) {
		teacherEmails = teacherEmails.filter((e) => e !== email);
	}
</script>

<svelte:head>
	<title>Register Your School — MeroSchool</title>
	<meta name="description" content="Register your school on MeroSchool. Get started in minutes with our simple onboarding process." />
</svelte:head>

<section class="py-20 sm:py-28">
	<div class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-12">
			<Badge variant="accent" class="mb-4">Onboarding</Badge>
			<h1 class="text-3xl font-bold sm:text-4xl">{$t("onboard.title")}</h1>
			<p class="mt-4 text-muted-foreground">{$t("onboard.subtitle")}</p>
		</div>

		{#if submitted}
			<Card class="p-12 text-center">
				<div class="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
					<span class="text-5xl text-green-600 dark:text-green-400">&#10003;</span>
					<div class="absolute inset-0 animate-ping rounded-full bg-green-400/20"></div>
				</div>
				<h2 class="text-2xl font-bold mb-2 text-green-600 dark:text-green-400">{$t("onboard.schoolReady")}</h2>
				<p class="text-muted-foreground mb-2">{$t("onboard.success")}</p>
				<div class="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
					<span class="rounded-full bg-muted px-3 py-1">{classes.length} classes</span>
					<span class="rounded-full bg-muted px-3 py-1">{Object.values(sections).flat().length} sections</span>
					<span class="rounded-full bg-muted px-3 py-1">{teacherEmails.length} teachers invited</span>
				</div>
				<div class="mt-8">
					<a href="/dashboard/teacher"><Button>{$t("onboard.goToDashboard")}</Button></a>
				</div>
			</Card>
		{:else}
			<!-- Visual Progress Stepper -->
			<div class="flex items-center justify-center gap-2 sm:gap-4 mb-10">
				{#each steps as s, i}
					<div class="flex items-center gap-1.5 sm:gap-2">
						<div class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 {step > s.num ? 'bg-green-600 text-white dark:bg-green-500' : step === s.num ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background' : 'bg-muted text-muted-foreground'}">
							{#if step > s.num}
								&#10003;
							{:else}
								{s.num}
							{/if}
						</div>
						<span class="text-sm hidden md:inline {step >= s.num ? 'text-foreground font-medium' : 'text-muted-foreground'}">{$t(s.key)}</span>
					</div>
					{#if i < steps.length - 1}
						<div class="w-6 sm:w-10 h-0.5 rounded transition-colors duration-300 {step > s.num ? 'bg-green-600 dark:bg-green-500' : 'bg-border'}"></div>
					{/if}
				{/each}
			</div>

			<Card class="p-8">
				<!-- Step 1: School Info -->
				{#if step === 1}
					<div class="space-y-5">
						<h2 class="text-xl font-semibold mb-6">{$t("onboard.step1")}</h2>
						<div>
							<label for="schoolName" class="block text-sm font-medium mb-1.5">{$t("onboard.schoolName")}</label>
							<Input id="schoolName" type="text" placeholder="Sunrise Academy" />
						</div>
						<div>
							<label for="schoolAddress" class="block text-sm font-medium mb-1.5">{$t("onboard.schoolAddress")}</label>
							<Input id="schoolAddress" type="text" placeholder="Putalisadak, Kathmandu" />
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="schoolPhone" class="block text-sm font-medium mb-1.5">{$t("onboard.schoolPhone")}</label>
								<Input id="schoolPhone" type="tel" placeholder="+977-1-4441234" />
							</div>
							<div>
								<label for="schoolEmail" class="block text-sm font-medium mb-1.5">{$t("onboard.schoolEmail")}</label>
								<Input id="schoolEmail" type="email" placeholder="info@school.edu.np" />
							</div>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="schoolType" class="block text-sm font-medium mb-1.5">{$t("onboard.schoolType")}</label>
								<Select id="schoolType">
									<option value="private">{$t("onboard.typePrivate")}</option>
									<option value="public">{$t("onboard.typePublic")}</option>
									<option value="community">{$t("onboard.typeCommunity")}</option>
								</Select>
							</div>
							<div>
								<label for="province" class="block text-sm font-medium mb-1.5">{$t("onboard.province")}</label>
								<Select id="province">
									{#each provinces as p}
										<option value={p}>{p}</option>
									{/each}
								</Select>
							</div>
						</div>
						<div>
							<label for="district" class="block text-sm font-medium mb-1.5">{$t("onboard.district")}</label>
							<Input id="district" type="text" placeholder="Kathmandu" />
						</div>
					</div>
				{/if}

				<!-- Step 2: Add Classes -->
				{#if step === 2}
					<div class="space-y-5">
						<h2 class="text-xl font-semibold mb-6">{$t("onboard.step2Title")}</h2>
						<div class="flex gap-3">
							<div class="flex-1">
								<label for="className" class="block text-sm font-medium mb-1.5">{$t("onboard.className")}</label>
								<Input
									id="className"
									type="text"
									placeholder={$t("onboard.classNamePlaceholder")}
									bind:value={newClassName}
									onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); addClass(); } }}
								/>
							</div>
							<div class="flex items-end">
								<Button onclick={addClass}>{$t("onboard.addClass")}</Button>
							</div>
						</div>

						{#if classes.length === 0}
							<p class="text-sm text-muted-foreground text-center py-6">{$t("onboard.noClasses")}</p>
						{:else}
							<div class="space-y-2">
								{#each classes as cls}
									<div class="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
										<span class="font-medium">{cls}</span>
										<Button variant="ghost" size="sm" onclick={() => removeClass(cls)}>
											{$t("onboard.remove")}
										</Button>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}

				<!-- Step 3: Add Sections -->
				{#if step === 3}
					<div class="space-y-5">
						<h2 class="text-xl font-semibold mb-6">{$t("onboard.step3Title")}</h2>

						{#if classes.length === 0}
							<p class="text-sm text-muted-foreground text-center py-6">{$t("onboard.noClasses")}</p>
						{:else}
							{#each classes as cls}
								<div class="rounded-lg border p-4">
									<h3 class="text-sm font-semibold mb-3">{$t("onboard.sectionsFor")} {cls}</h3>
									<div class="flex gap-3 mb-3">
										<div class="flex-1">
											<Input
												type="text"
												placeholder={$t("onboard.sectionPlaceholder")}
												value={newSectionInputs[cls] ?? ""}
												oninput={(e: Event) => { newSectionInputs = { ...newSectionInputs, [cls]: (e.target as HTMLInputElement).value }; }}
												onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); addSection(cls); } }}
											/>
										</div>
										<Button size="sm" onclick={() => addSection(cls)}>{$t("onboard.addSection")}</Button>
									</div>
									{#if (sections[cls] ?? []).length === 0}
										<p class="text-xs text-muted-foreground">{$t("onboard.noSections")}</p>
									{:else}
										<div class="flex flex-wrap gap-2">
											{#each sections[cls] ?? [] as sec}
												<Badge variant="secondary" class="flex items-center gap-1.5 px-3 py-1.5 text-sm">
													{sec}
													<button
														type="button"
														class="ml-1 text-muted-foreground hover:text-foreground cursor-pointer"
														onclick={() => removeSection(cls, sec)}
													>
														&times;
													</button>
												</Badge>
											{/each}
										</div>
									{/if}
								</div>
							{/each}
						{/if}
					</div>
				{/if}

				<!-- Step 4: Invite Teachers -->
				{#if step === 4}
					<div class="space-y-5">
						<h2 class="text-xl font-semibold mb-6">{$t("onboard.step4Title")}</h2>
						<div class="flex gap-3">
							<div class="flex-1">
								<label for="teacherEmail" class="block text-sm font-medium mb-1.5">{$t("onboard.teacherEmail")}</label>
								<Input
									id="teacherEmail"
									type="email"
									placeholder={$t("onboard.teacherEmailPlaceholder")}
									bind:value={newTeacherEmail}
									onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); addTeacher(); } }}
								/>
							</div>
							<div class="flex items-end">
								<Button onclick={addTeacher}>{$t("onboard.inviteTeacher")}</Button>
							</div>
						</div>

						{#if teacherEmails.length === 0}
							<p class="text-sm text-muted-foreground text-center py-6">{$t("onboard.noTeachers")}</p>
						{:else}
							<div class="space-y-2">
								{#each teacherEmails as email}
									<div class="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
										<span class="text-sm">{email}</span>
										<Button variant="ghost" size="sm" onclick={() => removeTeacher(email)}>
											{$t("onboard.remove")}
										</Button>
									</div>
								{/each}
							</div>
							<div class="pt-2">
								<Button variant="accent" class="w-full" onclick={handleSubmit}>
									{$t("onboard.sendInvites")}
								</Button>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Navigation -->
				<div class="flex justify-between mt-8 pt-6 border-t">
					{#if step > 1}
						<Button variant="outline" onclick={prevStep}>{$t("onboard.prev")}</Button>
					{:else}
						<div></div>
					{/if}
					{#if step < 4}
						<Button onclick={nextStep}>{$t("onboard.next")}</Button>
					{:else if teacherEmails.length === 0}
						<Button onclick={handleSubmit}>{$t("onboard.submit")}</Button>
					{/if}
				</div>
			</Card>
		{/if}
	</div>
</section>
