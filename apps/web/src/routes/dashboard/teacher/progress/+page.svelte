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

	const sampleStudents: StudentProgress[] = data.students ?? [
		{ id: 1, name: "Aarav Sharma", attendance: 92, testAvg: 85, assignmentsDone: 18, assignmentsTotal: 20, testScores: [{ subject: "Math", score: 88 }, { subject: "Science", score: 82 }, { subject: "English", score: 85 }], attendanceHistory: [95, 90, 88, 93, 91, 92] },
		{ id: 2, name: "Sita Adhikari", attendance: 88, testAvg: 91, assignmentsDone: 20, assignmentsTotal: 20, testScores: [{ subject: "Math", score: 95 }, { subject: "Science", score: 90 }, { subject: "English", score: 88 }], attendanceHistory: [85, 88, 90, 87, 89, 88] },
		{ id: 3, name: "Bikash Thapa", attendance: 45, testAvg: 35, assignmentsDone: 8, assignmentsTotal: 20, testScores: [{ subject: "Math", score: 30 }, { subject: "Science", score: 38 }, { subject: "English", score: 37 }], attendanceHistory: [50, 48, 42, 45, 43, 45] },
		{ id: 4, name: "Priya Gurung", attendance: 78, testAvg: 72, assignmentsDone: 16, assignmentsTotal: 20, testScores: [{ subject: "Math", score: 70 }, { subject: "Science", score: 75 }, { subject: "English", score: 71 }], attendanceHistory: [80, 75, 78, 76, 79, 78] },
		{ id: 5, name: "Ramesh KC", attendance: 55, testAvg: 48, assignmentsDone: 10, assignmentsTotal: 20, testScores: [{ subject: "Math", score: 45 }, { subject: "Science", score: 50 }, { subject: "English", score: 49 }], attendanceHistory: [60, 55, 52, 58, 54, 55] },
		{ id: 6, name: "Anita Poudel", attendance: 95, testAvg: 88, assignmentsDone: 19, assignmentsTotal: 20, testScores: [{ subject: "Math", score: 90 }, { subject: "Science", score: 85 }, { subject: "English", score: 89 }], attendanceHistory: [93, 96, 94, 95, 96, 95] },
		{ id: 7, name: "Dipak Rai", attendance: 38, testAvg: 28, assignmentsDone: 5, assignmentsTotal: 20, testScores: [{ subject: "Math", score: 25 }, { subject: "Science", score: 30 }, { subject: "English", score: 29 }], attendanceHistory: [40, 35, 38, 42, 36, 38] },
		{ id: 8, name: "Sunita BK", attendance: 82, testAvg: 76, assignmentsDone: 17, assignmentsTotal: 20, testScores: [{ subject: "Math", score: 78 }, { subject: "Science", score: 74 }, { subject: "English", score: 76 }], attendanceHistory: [80, 83, 81, 84, 82, 82] },
		{ id: 9, name: "Kiran Tamang", attendance: 68, testAvg: 58, assignmentsDone: 12, assignmentsTotal: 20, testScores: [{ subject: "Math", score: 55 }, { subject: "Science", score: 60 }, { subject: "English", score: 59 }], attendanceHistory: [70, 65, 68, 66, 69, 68] },
		{ id: 10, name: "Maya Lama", attendance: 90, testAvg: 82, assignmentsDone: 18, assignmentsTotal: 20, testScores: [{ subject: "Math", score: 84 }, { subject: "Science", score: 80 }, { subject: "English", score: 82 }], attendanceHistory: [88, 91, 89, 90, 92, 90] },
		{ id: 11, name: "Sujan Shrestha", attendance: 73, testAvg: 65, assignmentsDone: 14, assignmentsTotal: 20, testScores: [{ subject: "Math", score: 62 }, { subject: "Science", score: 68 }, { subject: "English", score: 65 }], attendanceHistory: [75, 70, 73, 72, 74, 73] },
		{ id: 12, name: "Nisha Magar", attendance: 96, testAvg: 94, assignmentsDone: 20, assignmentsTotal: 20, testScores: [{ subject: "Math", score: 96 }, { subject: "Science", score: 92 }, { subject: "English", score: 94 }], attendanceHistory: [94, 97, 95, 96, 97, 96] },
		{ id: 13, name: "Anil Basnet", attendance: 60, testAvg: 52, assignmentsDone: 11, assignmentsTotal: 20, testScores: [{ subject: "Math", score: 50 }, { subject: "Science", score: 55 }, { subject: "English", score: 51 }], attendanceHistory: [62, 58, 60, 61, 59, 60] },
		{ id: 14, name: "Sabina Dahal", attendance: 85, testAvg: 79, assignmentsDone: 17, assignmentsTotal: 20, testScores: [{ subject: "Math", score: 80 }, { subject: "Science", score: 78 }, { subject: "English", score: 79 }], attendanceHistory: [83, 86, 84, 85, 87, 85] },
		{ id: 15, name: "Rajan Pokharel", attendance: 42, testAvg: 32, assignmentsDone: 6, assignmentsTotal: 20, testScores: [{ subject: "Math", score: 28 }, { subject: "Science", score: 35 }, { subject: "English", score: 33 }], attendanceHistory: [45, 40, 42, 44, 41, 42] },
	];

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
		const rows = sampleStudents
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
					{#each sampleStudents as student, i}
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
