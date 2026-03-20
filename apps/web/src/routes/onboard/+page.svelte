<script lang="ts">
	import { t } from "$lib/i18n/index.js";
	import Button from "$lib/components/ui/button.svelte";
	import Input from "$lib/components/ui/input.svelte";
	import Select from "$lib/components/ui/select.svelte";
	import Card from "$lib/components/ui/card.svelte";
	import Badge from "$lib/components/ui/badge.svelte";

	let step = $state(1);
	let submitted = $state(false);

	const provinces = [
		"Koshi Pradesh",
		"Madhesh Pradesh",
		"Bagmati Pradesh",
		"Gandaki Pradesh",
		"Lumbini Pradesh",
		"Karnali Pradesh",
		"Sudurpashchim Pradesh",
	];

	function nextStep() {
		if (step < 3) step++;
	}

	function prevStep() {
		if (step > 1) step--;
	}

	function handleSubmit() {
		submitted = true;
	}

	const steps = [
		{ num: 1, key: "onboard.step1" },
		{ num: 2, key: "onboard.step2" },
		{ num: 3, key: "onboard.step3" },
	];
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
				<div class="text-5xl mb-4">&#10003;</div>
				<h2 class="text-2xl font-bold mb-2 text-accent">Success!</h2>
				<p class="text-muted-foreground">{$t("onboard.success")}</p>
				<div class="mt-6">
					<a href="/"><Button>Back to Home</Button></a>
				</div>
			</Card>
		{:else}
			<!-- Step indicator -->
			<div class="flex items-center justify-center gap-4 mb-10">
				{#each steps as s}
					<div class="flex items-center gap-2">
						<div class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium {step >= s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}">
							{s.num}
						</div>
						<span class="text-sm hidden sm:inline {step >= s.num ? 'text-foreground font-medium' : 'text-muted-foreground'}">{$t(s.key)}</span>
					</div>
					{#if s.num < 3}
						<div class="w-8 h-px {step > s.num ? 'bg-primary' : 'bg-border'}"></div>
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

				<!-- Step 2: Admin Account -->
				{#if step === 2}
					<div class="space-y-5">
						<h2 class="text-xl font-semibold mb-6">{$t("onboard.step2")}</h2>
						<div>
							<label for="adminName" class="block text-sm font-medium mb-1.5">{$t("onboard.adminName")}</label>
							<Input id="adminName" type="text" placeholder="Ram Bahadur Sharma" />
						</div>
						<div>
							<label for="adminEmail" class="block text-sm font-medium mb-1.5">{$t("onboard.adminEmail")}</label>
							<Input id="adminEmail" type="email" placeholder="admin@school.edu.np" />
						</div>
						<div>
							<label for="adminPhone" class="block text-sm font-medium mb-1.5">{$t("onboard.adminPhone")}</label>
							<Input id="adminPhone" type="tel" placeholder="+977-98XXXXXXXX" />
						</div>
						<div>
							<label for="adminPassword" class="block text-sm font-medium mb-1.5">{$t("onboard.adminPassword")}</label>
							<Input id="adminPassword" type="password" placeholder="********" />
						</div>
						<div>
							<label for="adminConfirm" class="block text-sm font-medium mb-1.5">{$t("onboard.adminConfirm")}</label>
							<Input id="adminConfirm" type="password" placeholder="********" />
						</div>
					</div>
				{/if}

				<!-- Step 3: Academic Config -->
				{#if step === 3}
					<div class="space-y-5">
						<h2 class="text-xl font-semibold mb-6">{$t("onboard.step3")}</h2>
						<div>
							<label for="academicYear" class="block text-sm font-medium mb-1.5">{$t("onboard.academicYear")}</label>
							<Select id="academicYear">
								<option value="baisakh">Baisakh (Nepali Calendar)</option>
								<option value="april">April (English Calendar)</option>
							</Select>
						</div>
						<div>
							<label for="gradingSystem" class="block text-sm font-medium mb-1.5">{$t("onboard.gradingSystem")}</label>
							<Select id="gradingSystem">
								<option value="gpa">{$t("onboard.gradeGPA")}</option>
								<option value="percentage">{$t("onboard.gradePercentage")}</option>
								<option value="letter">{$t("onboard.gradeLetter")}</option>
							</Select>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="classes" class="block text-sm font-medium mb-1.5">{$t("onboard.classes")}</label>
								<Select id="classes">
									{#each Array.from({length: 12}, (_, i) => i + 1) as n}
										<option value={n}>{n}</option>
									{/each}
								</Select>
							</div>
							<div>
								<label for="sections" class="block text-sm font-medium mb-1.5">{$t("onboard.sections")}</label>
								<Select id="sections">
									{#each ["A", "A-B", "A-C", "A-D"] as s}
										<option value={s}>{s}</option>
									{/each}
								</Select>
							</div>
						</div>
					</div>
				{/if}

				<!-- Navigation -->
				<div class="flex justify-between mt-8 pt-6 border-t">
					{#if step > 1}
						<Button variant="outline" onclick={prevStep}>{$t("onboard.prev")}</Button>
					{:else}
						<div></div>
					{/if}
					{#if step < 3}
						<Button onclick={nextStep}>{$t("onboard.next")}</Button>
					{:else}
						<Button onclick={handleSubmit}>{$t("onboard.submit")}</Button>
					{/if}
				</div>
			</Card>
		{/if}
	</div>
</section>
