<script lang="ts">
import Badge from '$lib/components/ui/badge.svelte'
import Button from '$lib/components/ui/button.svelte'
import Card from '$lib/components/ui/card.svelte'
import { t } from '$lib/i18n/index.js'

const freeFeatures = ['freeF1', 'freeF2', 'freeF3', 'freeF4', 'freeF5', 'freeF6']
const premiumFeatures = [
	'premiumF1',
	'premiumF2',
	'premiumF3',
	'premiumF4',
	'premiumF5',
	'premiumF6',
	'premiumF7',
	'premiumF8',
]
</script>

<svelte:head>
	<title>Pricing — MeroSchool</title>
	<meta name="description" content="MeroSchool pricing plans. Start free with up to 200 students. Premium plan for growing schools at Rs. 15,000/year." />
</svelte:head>

<section class="py-20 sm:py-28">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center max-w-2xl mx-auto mb-16">
			<Badge variant="accent" class="mb-4">Pricing</Badge>
			<h1 class="text-3xl font-bold sm:text-4xl lg:text-5xl">{$t("pricing.title")}</h1>
			<p class="mt-4 text-lg text-muted-foreground">{$t("pricing.subtitle")}</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
			<!-- Free Tier -->
			<Card class="p-8 flex flex-col">
				<h3 class="text-2xl font-bold">{$t("pricing.free")}</h3>
				<p class="text-sm text-muted-foreground mt-1">{$t("pricing.freeDesc")}</p>
				<div class="mt-6">
					<span class="text-4xl font-bold">{$t("pricing.freePrice")}</span>
				</div>
				<ul class="mt-8 space-y-3 flex-1">
					{#each freeFeatures as f}
						<li class="flex items-center gap-3 text-sm">
							<svg class="h-5 w-5 text-accent shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
							{$t(`pricing.${f}`)}
						</li>
					{/each}
				</ul>
				<div class="mt-8">
					<a href="/onboard">
						<Button variant="outline" class="w-full">{$t("pricing.freeCta")}</Button>
					</a>
				</div>
			</Card>

			<!-- Premium Tier -->
			<Card class="p-8 flex flex-col border-primary/50 shadow-lg relative">
				<div class="absolute -top-3 right-6">
					<Badge variant="default">{$t("pricing.popular")}</Badge>
				</div>
				<h3 class="text-2xl font-bold">{$t("pricing.premium")}</h3>
				<p class="text-sm text-muted-foreground mt-1">{$t("pricing.premiumDesc")}</p>
				<div class="mt-6">
					<span class="text-4xl font-bold">{$t("pricing.premiumPrice")}</span>
					<span class="text-muted-foreground">{$t("pricing.premiumPeriod")}</span>
				</div>
				<ul class="mt-8 space-y-3 flex-1">
					{#each premiumFeatures as f}
						<li class="flex items-center gap-3 text-sm">
							<svg class="h-5 w-5 text-accent shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
							{$t(`pricing.${f}`)}
						</li>
					{/each}
				</ul>
				<div class="mt-8">
					<a href="/onboard">
						<Button class="w-full">{$t("pricing.premiumCta")}</Button>
					</a>
				</div>
			</Card>
		</div>
	</div>
</section>
