<script lang="ts">
	import { t } from "$lib/i18n/index.js";
	import Card from "$lib/components/ui/card.svelte";
	import Badge from "$lib/components/ui/badge.svelte";

	const features = [
		{ icon: "👨‍🎓", key: "studentMgmt", descKey: "studentMgmtDesc", color: "primary" },
		{ icon: "👩‍🏫", key: "teacherMgmt", descKey: "teacherMgmtDesc", color: "accent" },
		{ icon: "📝", key: "examMgmt", descKey: "examMgmtDesc", color: "chart-1" },
		{ icon: "📋", key: "attendance", descKey: "attendanceDesc", color: "chart-2" },
		{ icon: "💰", key: "fees", descKey: "feesDesc", color: "chart-4" },
		{ icon: "💬", key: "communication", descKey: "communicationDesc", color: "primary" },
		{ icon: "📊", key: "reports", descKey: "reportsDesc", color: "accent" },
		{ icon: "📚", key: "library", descKey: "libraryDesc", color: "chart-1" },
		{ icon: "🚌", key: "transport", descKey: "transportDesc", color: "chart-2" },
		{ icon: "🏠", key: "hostel", descKey: "hostelDesc", color: "chart-4" },
		{ icon: "📱", key: "mobile", descKey: "mobileDesc", color: "primary" },
		{ icon: "📚", key: "academics", descKey: "academicsDesc", color: "accent" },
	];
</script>

<svelte:head>
	<title>Features — MeroSchool</title>
	<meta name="description" content="Explore MeroSchool's comprehensive features for school management including attendance, exams, fees, transport, and more." />
</svelte:head>

<section class="py-20 sm:py-28">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center max-w-2xl mx-auto mb-16">
			<Badge variant="accent" class="mb-4">Features</Badge>
			<h1 class="text-3xl font-bold sm:text-4xl lg:text-5xl">{$t("features.pageTitle")}</h1>
			<p class="mt-4 text-lg text-muted-foreground">{$t("features.pageSubtitle")}</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each features as feature}
				<Card class="p-6 hover:shadow-lg transition-all hover:-translate-y-1 group">
					<div class="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
					<h3 class="text-lg font-semibold mb-2">{$t(`features.${feature.key}`)}</h3>
					<p class="text-sm text-muted-foreground leading-relaxed">{$t(`features.${feature.descKey}`)}</p>
				</Card>
			{/each}
		</div>
	</div>
</section>
