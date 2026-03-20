<script lang="ts">
	import { t } from "$lib/i18n/index.js";
	import Button from "$lib/components/ui/button.svelte";
	import Input from "$lib/components/ui/input.svelte";
	import Textarea from "$lib/components/ui/textarea.svelte";
	import Card from "$lib/components/ui/card.svelte";
	import Badge from "$lib/components/ui/badge.svelte";
</script>

<svelte:head>
	<title>Contact — MeroSchool</title>
	<meta name="description" content="Get in touch with MeroSchool. Our office is in Putalisadak, Kathmandu, Nepal." />
</svelte:head>

<section class="py-20 sm:py-28">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center max-w-2xl mx-auto mb-16">
			<Badge variant="accent" class="mb-4">Contact</Badge>
			<h1 class="text-3xl font-bold sm:text-4xl lg:text-5xl">{$t("contact.title")}</h1>
			<p class="mt-4 text-lg text-muted-foreground">{$t("contact.subtitle")}</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
			<!-- Contact Form -->
			<Card class="p-8">
				<form class="space-y-5">
					<div>
						<label for="name" class="block text-sm font-medium mb-1.5">{$t("contact.name")}</label>
						<Input id="name" type="text" placeholder="Ram Sharma" required />
					</div>
					<div>
						<label for="email" class="block text-sm font-medium mb-1.5">{$t("contact.email")}</label>
						<Input id="email" type="email" placeholder="ram@school.edu.np" required />
					</div>
					<div>
						<label for="school" class="block text-sm font-medium mb-1.5">{$t("contact.school")}</label>
						<Input id="school" type="text" placeholder="Sunrise Academy" />
					</div>
					<div>
						<label for="message" class="block text-sm font-medium mb-1.5">{$t("contact.message")}</label>
						<Textarea id="message" rows={4} placeholder="Tell us how we can help..." required />
					</div>
					<Button type="submit" class="w-full">{$t("contact.send")}</Button>
				</form>
			</Card>

			<!-- Contact Info -->
			<div class="space-y-8">
				<div>
					<h3 class="text-lg font-semibold mb-4">{$t("contact.office")}</h3>
					<div class="space-y-4 text-sm text-muted-foreground">
						<div class="flex items-start gap-3">
							<svg class="h-5 w-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
							<span>{$t("contact.address")}</span>
						</div>
						<div class="flex items-center gap-3">
							<svg class="h-5 w-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
							<span>{$t("contact.phone")}</span>
						</div>
						<div class="flex items-center gap-3">
							<svg class="h-5 w-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
							<span>{$t("contact.emailAddr")}</span>
						</div>
					</div>
				</div>

				<!-- Map placeholder -->
				<div class="rounded-xl border bg-muted/30 h-64 flex items-center justify-center">
					<div class="text-center text-muted-foreground">
						<svg class="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
						<p class="text-sm">Putalisadak, Kathmandu</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
