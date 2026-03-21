<script lang="ts">
import Badge from '$lib/components/ui/badge.svelte'
import Card from '$lib/components/ui/card.svelte'
import { t } from '$lib/i18n/index.js'

const values = [
	{ key: 'value1', descKey: 'value1Desc', icon: '🎓' },
	{ key: 'value2', descKey: 'value2Desc', icon: '🌐' },
	{ key: 'value3', descKey: 'value3Desc', icon: '🇳🇵' },
	{ key: 'value4', descKey: 'value4Desc', icon: '🔒' },
]
</script>

<svelte:head>
	<title>About — MeroSchool</title>
	<meta name="description" content="Learn about MeroSchool's mission to empower Nepali schools with affordable, easy-to-use technology." />
</svelte:head>

<section class="py-20 sm:py-28">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center max-w-2xl mx-auto mb-16">
			<Badge variant="accent" class="mb-4">About</Badge>
			<h1 class="text-3xl font-bold sm:text-4xl lg:text-5xl">{$t("about.title")}</h1>
			<p class="mt-4 text-lg text-muted-foreground">{$t("about.subtitle")}</p>
		</div>

		<!-- Mission -->
		<div class="max-w-3xl mx-auto mb-20">
			<div class="rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 p-8 sm:p-12">
				<h2 class="text-2xl font-bold mb-4">{$t("about.mission")}</h2>
				<p class="text-muted-foreground leading-relaxed text-lg">{$t("about.missionText")}</p>
			</div>
		</div>

		<!-- Story -->
		<div class="max-w-3xl mx-auto mb-20">
			<h2 class="text-2xl font-bold mb-4">{$t("about.story")}</h2>
			<p class="text-muted-foreground leading-relaxed">{$t("about.storyText")}</p>
		</div>

		<!-- Values -->
		<div class="max-w-4xl mx-auto">
			<h2 class="text-2xl font-bold mb-8 text-center">{$t("about.values")}</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
				{#each values as value}
					<Card class="p-6">
						<div class="text-3xl mb-3">{value.icon}</div>
						<h3 class="text-lg font-semibold mb-2">{$t(`about.${value.key}`)}</h3>
						<p class="text-sm text-muted-foreground">{$t(`about.${value.descKey}`)}</p>
					</Card>
				{/each}
			</div>
		</div>

		<!-- Team stats -->
		<div class="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto text-center">
			{#each [
				{ label: "Team Members", value: "25+" },
				{ label: "Schools Served", value: "500+" },
				{ label: "Provinces", value: "7/7" },
				{ label: "Years Active", value: "3+" },
			] as stat}
				<div>
					<div class="text-3xl font-bold text-primary">{stat.value}</div>
					<div class="text-sm text-muted-foreground mt-1">{stat.label}</div>
				</div>
			{/each}
		</div>
	</div>
</section>
