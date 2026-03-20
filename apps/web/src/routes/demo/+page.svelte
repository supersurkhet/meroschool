<script lang="ts">
	import { t } from "$lib/i18n/index.js";
	import Card from "$lib/components/ui/card.svelte";
	import Badge from "$lib/components/ui/badge.svelte";
	import Button from "$lib/components/ui/button.svelte";

	let activeTab = $state<"student" | "teacher" | "parent" | "admin">("student");

	const tabs = [
		{ key: "student" as const, icon: "🎓", labelKey: "demo.student" },
		{ key: "teacher" as const, icon: "👩‍🏫", labelKey: "demo.teacher" },
		{ key: "parent" as const, icon: "👨‍👩‍👧", labelKey: "demo.parent" },
		{ key: "admin" as const, icon: "🏫", labelKey: "demo.admin" },
	];

	// Sample data for demos
	const studentSchedule = [
		{ time: "10:00", subject: "Mathematics", teacher: "R. Sharma", room: "201" },
		{ time: "10:45", subject: "Science", teacher: "S. Thapa", room: "Lab 1" },
		{ time: "11:30", subject: "English", teacher: "K. Adhikari", room: "105" },
		{ time: "12:15", subject: "Lunch Break", teacher: "—", room: "—" },
		{ time: "13:00", subject: "Nepali", teacher: "P. Poudel", room: "201" },
		{ time: "13:45", subject: "Social Studies", teacher: "M. Gurung", room: "302" },
	];

	const studentGrades = [
		{ subject: "Mathematics", grade: "A", marks: 88 },
		{ subject: "Science", grade: "A+", marks: 92 },
		{ subject: "English", grade: "B+", marks: 78 },
		{ subject: "Nepali", grade: "A", marks: 85 },
		{ subject: "Social Studies", grade: "A", marks: 86 },
	];

	const teacherClasses = [
		{ class: "Class 10 - A", students: 42, subject: "Mathematics", nextClass: "10:00 AM" },
		{ class: "Class 9 - B", students: 38, subject: "Mathematics", nextClass: "11:30 AM" },
		{ class: "Class 10 - C", students: 40, subject: "Mathematics", nextClass: "1:00 PM" },
	];

	const parentChildren = [
		{ name: "Aarav Sharma", class: "Class 10 - A", attendance: "94%", rank: 5 },
		{ name: "Ananya Sharma", class: "Class 7 - B", attendance: "97%", rank: 3 },
	];

	const adminStats = [
		{ label: "Total Students", value: "1,247", change: "+12" },
		{ label: "Total Teachers", value: "86", change: "+2" },
		{ label: "Attendance Today", value: "94.2%", change: "+1.1%" },
		{ label: "Fee Collection", value: "Rs.12,40,000", change: "+Rs.85K" },
	];
</script>

<svelte:head>
	<title>Demo — MeroSchool</title>
	<meta name="description" content="Explore interactive demos of MeroSchool dashboards for students, teachers, parents, and administrators." />
</svelte:head>

<section class="py-20 sm:py-28">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center max-w-2xl mx-auto mb-12">
			<Badge variant="accent" class="mb-4">Interactive Demo</Badge>
			<h1 class="text-3xl font-bold sm:text-4xl lg:text-5xl">{$t("demo.title")}</h1>
			<p class="mt-4 text-lg text-muted-foreground">{$t("demo.subtitle")}</p>
		</div>

		<!-- Role tabs -->
		<div class="flex flex-wrap justify-center gap-2 mb-10">
			{#each tabs as tab}
				<button
					onclick={() => activeTab = tab.key}
					class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer {activeTab === tab.key ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:text-foreground'}"
				>
					<span>{tab.icon}</span>
					{$t(tab.labelKey)}
				</button>
			{/each}
		</div>

		<!-- Student Dashboard -->
		{#if activeTab === "student"}
			<div class="space-y-6">
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					<Card class="p-4 text-center">
						<div class="text-2xl font-bold text-primary">94%</div>
						<div class="text-xs text-muted-foreground mt-1">Attendance</div>
					</Card>
					<Card class="p-4 text-center">
						<div class="text-2xl font-bold text-accent">3.7</div>
						<div class="text-xs text-muted-foreground mt-1">GPA</div>
					</Card>
					<Card class="p-4 text-center">
						<div class="text-2xl font-bold text-chart-1">5th</div>
						<div class="text-xs text-muted-foreground mt-1">Class Rank</div>
					</Card>
					<Card class="p-4 text-center">
						<div class="text-2xl font-bold text-chart-4">3</div>
						<div class="text-xs text-muted-foreground mt-1">Pending Tasks</div>
					</Card>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Card class="p-6">
						<h3 class="font-semibold mb-4">Today's Schedule</h3>
						<div class="space-y-3">
							{#each studentSchedule as item}
								<div class="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
									<span class="text-sm font-mono text-muted-foreground w-12">{item.time}</span>
									<div class="flex-1">
										<div class="text-sm font-medium">{item.subject}</div>
										<div class="text-xs text-muted-foreground">{item.teacher} &middot; Room {item.room}</div>
									</div>
								</div>
							{/each}
						</div>
					</Card>

					<Card class="p-6">
						<h3 class="font-semibold mb-4">Recent Grades</h3>
						<div class="space-y-3">
							{#each studentGrades as item}
								<div class="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
									<span class="text-sm">{item.subject}</span>
									<div class="flex items-center gap-3">
										<div class="w-24 bg-muted rounded-full h-2">
											<div class="h-2 rounded-full bg-primary" style="width: {item.marks}%"></div>
										</div>
										<Badge variant={item.grade.startsWith("A") ? "accent" : "secondary"}>{item.grade}</Badge>
									</div>
								</div>
							{/each}
						</div>
					</Card>
				</div>
			</div>
		{/if}

		<!-- Teacher Dashboard -->
		{#if activeTab === "teacher"}
			<div class="space-y-6">
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					<Card class="p-4 text-center">
						<div class="text-2xl font-bold text-primary">3</div>
						<div class="text-xs text-muted-foreground mt-1">Classes Today</div>
					</Card>
					<Card class="p-4 text-center">
						<div class="text-2xl font-bold text-accent">120</div>
						<div class="text-xs text-muted-foreground mt-1">Total Students</div>
					</Card>
					<Card class="p-4 text-center">
						<div class="text-2xl font-bold text-chart-1">8</div>
						<div class="text-xs text-muted-foreground mt-1">Assignments Due</div>
					</Card>
					<Card class="p-4 text-center">
						<div class="text-2xl font-bold text-chart-4">5</div>
						<div class="text-xs text-muted-foreground mt-1">Messages</div>
					</Card>
				</div>

				<Card class="p-6">
					<h3 class="font-semibold mb-4">My Classes</h3>
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b text-left text-muted-foreground">
									<th class="pb-3 font-medium">Class</th>
									<th class="pb-3 font-medium">Subject</th>
									<th class="pb-3 font-medium">Students</th>
									<th class="pb-3 font-medium">Next Class</th>
									<th class="pb-3 font-medium">Action</th>
								</tr>
							</thead>
							<tbody>
								{#each teacherClasses as cls}
									<tr class="border-b last:border-0">
										<td class="py-3 font-medium">{cls.class}</td>
										<td class="py-3 text-muted-foreground">{cls.subject}</td>
										<td class="py-3 text-muted-foreground">{cls.students}</td>
										<td class="py-3 text-muted-foreground">{cls.nextClass}</td>
										<td class="py-3"><Button size="sm" variant="outline">Take Attendance</Button></td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</Card>

				<Card class="p-6">
					<h3 class="font-semibold mb-4">Quick Attendance — Class 10 A</h3>
					<div class="grid grid-cols-6 sm:grid-cols-10 gap-2">
						{#each Array.from({length: 42}, (_, i) => i + 1) as n}
							{@const present = Math.random() > 0.08}
							<button class="h-10 w-full rounded-lg text-xs font-medium transition-colors cursor-pointer {present ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}">
								{n}
							</button>
						{/each}
					</div>
					<div class="flex gap-4 mt-4 text-xs text-muted-foreground">
						<span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-accent/20"></span> Present</span>
						<span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-destructive/20"></span> Absent</span>
					</div>
				</Card>
			</div>
		{/if}

		<!-- Parent Dashboard -->
		{#if activeTab === "parent"}
			<div class="space-y-6">
				<Card class="p-6">
					<h3 class="font-semibold mb-4">My Children</h3>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{#each parentChildren as child}
							<div class="rounded-xl border p-5 hover:shadow-md transition-shadow">
								<div class="flex items-center gap-4 mb-4">
									<div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
										{child.name[0]}
									</div>
									<div>
										<div class="font-semibold">{child.name}</div>
										<div class="text-sm text-muted-foreground">{child.class}</div>
									</div>
								</div>
								<div class="grid grid-cols-2 gap-3">
									<div class="text-center p-2 rounded-lg bg-muted/50">
										<div class="text-lg font-bold text-accent">{child.attendance}</div>
										<div class="text-xs text-muted-foreground">Attendance</div>
									</div>
									<div class="text-center p-2 rounded-lg bg-muted/50">
										<div class="text-lg font-bold text-primary">#{child.rank}</div>
										<div class="text-xs text-muted-foreground">Class Rank</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</Card>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Card class="p-6">
						<h3 class="font-semibold mb-4">Recent Notifications</h3>
						<div class="space-y-3">
							{#each [
								{ msg: "Parent-Teacher meeting on Chaitra 15", time: "2 hours ago", type: "info" },
								{ msg: "Aarav scored 92% in Science exam", time: "Yesterday", type: "success" },
								{ msg: "Fee reminder: Rs. 15,000 due by Chaitra 20", time: "2 days ago", type: "warning" },
								{ msg: "Annual sports day on Chaitra 25", time: "3 days ago", type: "info" },
							] as notif}
								<div class="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
									<div class="h-2 w-2 rounded-full mt-1.5 shrink-0 {notif.type === 'success' ? 'bg-accent' : notif.type === 'warning' ? 'bg-chart-4' : 'bg-primary'}"></div>
									<div class="flex-1">
										<div class="text-sm">{notif.msg}</div>
										<div class="text-xs text-muted-foreground mt-0.5">{notif.time}</div>
									</div>
								</div>
							{/each}
						</div>
					</Card>

					<Card class="p-6">
						<h3 class="font-semibold mb-4">Fee Status</h3>
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<span class="text-sm">Total Annual Fee</span>
								<span class="font-semibold">Rs. 60,000</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-sm text-accent">Paid</span>
								<span class="font-semibold text-accent">Rs. 45,000</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-sm text-chart-1">Remaining</span>
								<span class="font-semibold text-chart-1">Rs. 15,000</span>
							</div>
							<div class="w-full bg-muted rounded-full h-3 mt-2">
								<div class="h-3 rounded-full bg-accent" style="width: 75%"></div>
							</div>
							<Button class="w-full mt-2">Pay Now via eSewa/Khalti</Button>
						</div>
					</Card>
				</div>
			</div>
		{/if}

		<!-- Admin Dashboard -->
		{#if activeTab === "admin"}
			<div class="space-y-6">
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					{#each adminStats as stat}
						<Card class="p-4">
							<div class="text-xs text-muted-foreground">{stat.label}</div>
							<div class="text-2xl font-bold mt-1">{stat.value}</div>
							<div class="text-xs text-accent mt-1">{stat.change} this month</div>
						</Card>
					{/each}
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Card class="p-6">
						<h3 class="font-semibold mb-4">Attendance Trend (Last 7 Days)</h3>
						<div class="flex items-end gap-2 h-40">
							{#each [89, 92, 91, 94, 93, 95, 94] as pct, i}
								<div class="flex-1 flex flex-col items-center gap-1">
									<div class="text-[10px] text-muted-foreground">{pct}%</div>
									<div class="w-full rounded-t bg-primary/70" style="height: {(pct - 85) * 10}%"></div>
									<div class="text-[10px] text-muted-foreground">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}</div>
								</div>
							{/each}
						</div>
					</Card>

					<Card class="p-6">
						<h3 class="font-semibold mb-4">Fee Collection (Monthly)</h3>
						<div class="flex items-end gap-2 h-40">
							{#each [8, 12, 6, 15, 10, 14, 12, 9, 11, 13, 12, 8] as val, i}
								<div class="flex-1 flex flex-col items-center gap-1">
									<div class="text-[10px] text-muted-foreground">{val}L</div>
									<div class="w-full rounded-t bg-accent/70" style="height: {(val / 15) * 100}%"></div>
									<div class="text-[10px] text-muted-foreground">{["B", "J", "A", "S", "B", "M", "P", "A", "K", "M", "F", "C"][i]}</div>
								</div>
							{/each}
						</div>
					</Card>
				</div>

				<Card class="p-6">
					<h3 class="font-semibold mb-4">Recent Activity</h3>
					<div class="space-y-3">
						{#each [
							{ action: "New student enrolled: Bipana Tamang, Class 8-A", time: "10 min ago" },
							{ action: "Fee payment received: Rs. 15,000 from Aarav Sharma", time: "25 min ago" },
							{ action: "Teacher leave approved: S. Thapa (2 days)", time: "1 hour ago" },
							{ action: "Exam results published: Class 10 Final Term", time: "2 hours ago" },
							{ action: "New announcement: Sports Day schedule published", time: "3 hours ago" },
						] as item}
							<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 text-sm">
								<div class="h-2 w-2 rounded-full bg-primary shrink-0"></div>
								<span class="flex-1">{item.action}</span>
								<span class="text-xs text-muted-foreground shrink-0">{item.time}</span>
							</div>
						{/each}
					</div>
				</Card>
			</div>
		{/if}
	</div>
</section>
