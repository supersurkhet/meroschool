<script lang="ts">
	import { t } from "$lib/i18n/index.js";
	import Button from "$lib/components/ui/button.svelte";
	import Card from "$lib/components/ui/card.svelte";
	import Select from "$lib/components/ui/select.svelte";
	import Badge from "$lib/components/ui/badge.svelte";

	let { data } = $props();

	interface StudentProgress {
		id: number;
		name: string;
		attendance: number;
		testAvg: number;
		assignmentsDone: number;
		assignmentsTotal: number;
		testScores: { subject: string; score: number }[];
		attendanceHistory: number[];
	}

	const sections = ["Class 10 - A", "Class 10 - B", "Class 9 - A", "Class 9 - B"];
	let selectedSection = $state(sections[0]);
	let expandedId = $state<number | null>(null);

	const students: StudentProgress[] = data.students ?? [];

	const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

	function getColorClass(value: number): string {
		if (value > 70) return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
		if (value >= 40) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
		return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
	}

	function overallRating(s: StudentProgress): number {
		const assignmentPct = s.assignmentsTotal > 0 ? (s.assignmentsDone / s.assignmentsTotal) * 100 : 0;
		return Math.round((s.attendance + s.testAvg + assignmentPct) / 3);
	}

	function toggleExpand(id: number) {
		expandedId = expandedId === id ? null : id;
	}

	function exportCSV() {
		const header = "Student Name,Attendance %,Test Avg %,Assignments Done,Overall %\n";
		const rows = students
			.map((s) => `${s.name},${s.attendance},${s.testAvg},${s.assignmentsDone}/${s.assignmentsTotal},${overallRating(s)}`)
			.join("\n");
		const blob = new Blob([header + rows], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `progress-${selectedSection.replace(/\s+/g, "-")}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>{$t("progress.title")} — MeroSchool</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<h1 class="text-2xl font-bold">{$t("progress.title")}</h1>
		<div class="flex items-center gap-3">
			<div class="w-48">
				<Select bind:value={selectedSection}>
					{#each sections as sec}
						<option value={sec}>{sec}</option>
					{/each}
				</Select>
			</div>
			<Button variant="outline" onclick={exportCSV}>{$t("progress.exportCSV")}</Button>
		</div>
	</div>

	<!-- Progress Table -->
	<Card class="overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b bg-muted/50">
						<th class="px-4 py-3 text-left font-medium">#</th>
						<th class="px-4 py-3 text-left font-medium">{$t("progress.studentName")}</th>
						<th class="px-4 py-3 text-center font-medium">{$t("progress.attendancePct")}</th>
						<th class="px-4 py-3 text-center font-medium">{$t("progress.testAvg")}</th>
						<th class="px-4 py-3 text-center font-medium">{$t("progress.assignmentsDone")}</th>
						<th class="px-4 py-3 text-center font-medium">{$t("progress.overallRating")}</th>
					</tr>
				</thead>
				<tbody>
					{#each students as student, i}
						{@const overall = overallRating(student)}
						<tr
							class="border-b transition-colors hover:bg-muted/30 cursor-pointer"
							onclick={() => toggleExpand(student.id)}
						>
							<td class="px-4 py-3 text-muted-foreground">{i + 1}</td>
							<td class="px-4 py-3 font-medium">{student.name}</td>
							<td class="px-4 py-3 text-center">
								<span class="inline-block rounded-md px-2.5 py-1 text-xs font-semibold {getColorClass(student.attendance)}">
									{student.attendance}%
								</span>
							</td>
							<td class="px-4 py-3 text-center">
								<span class="inline-block rounded-md px-2.5 py-1 text-xs font-semibold {getColorClass(student.testAvg)}">
									{student.testAvg}%
								</span>
							</td>
							<td class="px-4 py-3 text-center">
								<span class="text-muted-foreground">{student.assignmentsDone}/{student.assignmentsTotal}</span>
							</td>
							<td class="px-4 py-3 text-center">
								<span class="inline-block rounded-md px-2.5 py-1 text-xs font-semibold {getColorClass(overall)}">
									{overall}%
								</span>
							</td>
						</tr>

						<!-- Expanded Detail -->
						{#if expandedId === student.id}
							<tr>
								<td colspan="6" class="px-4 py-4 bg-muted/20">
									<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
										<!-- Attendance Trend -->
										<Card class="p-4">
											<h4 class="text-sm font-semibold mb-4">{$t("progress.attendanceTrend")}</h4>
											<div class="flex items-end gap-2 h-32">
												{#each student.attendanceHistory as pct, mi}
													<div class="flex-1 flex flex-col items-center gap-1">
														<span class="text-xs text-muted-foreground">{pct}%</span>
														<div
															class="w-full rounded-t-md transition-all {pct > 70 ? 'bg-green-500 dark:bg-green-600' : pct >= 40 ? 'bg-yellow-500 dark:bg-yellow-600' : 'bg-red-500 dark:bg-red-600'}"
															style="height: {pct}%"
														></div>
														<span class="text-xs text-muted-foreground">{months[mi]}</span>
													</div>
												{/each}
											</div>
										</Card>

										<!-- Test Scores -->
										<Card class="p-4">
											<h4 class="text-sm font-semibold mb-4">{$t("progress.testScores")}</h4>
											<div class="space-y-3">
												{#each student.testScores as ts}
													<div class="flex items-center justify-between">
														<span class="text-sm">{ts.subject}</span>
														<div class="flex items-center gap-2">
															<div class="w-32 h-2 rounded-full bg-muted overflow-hidden">
																<div
																	class="h-full rounded-full transition-all {ts.score > 70 ? 'bg-green-500' : ts.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}"
																	style="width: {ts.score}%"
																></div>
															</div>
															<span class="text-sm font-medium w-10 text-right">{ts.score}%</span>
														</div>
													</div>
												{/each}
											</div>
										</Card>
									</div>
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	</Card>
</div>
