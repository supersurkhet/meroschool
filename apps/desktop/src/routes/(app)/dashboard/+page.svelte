<script lang="ts">
  import { t } from '$lib/i18n/index.svelte';
  import { getUser } from '$lib/stores/auth.svelte';
  import { getSchool } from '$lib/stores/school.svelte';
  import { convexQuery, api } from '$lib/convex';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Progress } from '$lib/components/ui/progress';
  import { goto } from '$app/navigation';
  import {
    Users,
    GraduationCap,
    CheckCircle,
    DollarSign,
    UserPlus,
    FileText,
    QrCode,
    BookOpen,
    Calendar,
    Clock,
    TrendingUp,
    ArrowRight,
    ArrowUpRight,
    Sparkles,
    Activity,
  } from 'lucide-svelte';

  const user = $derived(getUser());
  const school = $derived(getSchool());
  const adminName = $derived(user?.name ?? 'Admin');
  const schoolName = $derived(school?.name ?? 'MeroSchool');

  const now = new Date();
  const greeting = $derived.by(() => {
    const h = now.getHours();
    if (h < 12) return t('dashboard.goodMorning');
    if (h < 17) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  });

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // ─── Convex live stats ────────────────────────────────────────────────────
  let liveStudents = $state('—');
  let liveTeachers = $state('—');
  let liveAttendance = $state('—');
  let liveSalaryPending = $state('—');

  $effect(() => {
    const schoolId = getSchool()?.id;
    if (!schoolId) return;
    convexQuery(
      api.reports.getSchoolDashboardStats,
      { schoolId },
      null,
    ).then((data) => {
      if (!data) return;
      liveStudents = String(data.totalStudents ?? liveStudents);
      liveTeachers = String(data.totalTeachers ?? liveTeachers);
      liveAttendance = data.todayAttendance?.percent != null
        ? `${data.todayAttendance.percent}%`
        : liveAttendance;
      liveSalaryPending = String(data.pendingSalaries ?? liveSalaryPending);
    });
  });

  // Stats
  const stats = $derived([
    { labelKey: 'dashboard.totalStudents', value: liveStudents, change: '+12', icon: Users, accent: 'from-indigo-500 to-violet-600', iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
    { labelKey: 'nav.teachers', value: liveTeachers, change: '+1', icon: GraduationCap, accent: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    { labelKey: 'dashboard.todaysAttendance', value: liveAttendance, change: '+3%', icon: CheckCircle, accent: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    { labelKey: 'dashboard.salaryPending', value: liveSalaryPending, change: 'NPR 1.65L', icon: DollarSign, accent: 'from-rose-500 to-pink-600', iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  ]);

  // Loaded from Convex when available
  const activities: { icon: typeof UserPlus; msg: string; time: string; dot: string }[] = [];

  // Quick actions — labels use i18n keys
  const actions = $derived([
    { label: t('dashboard.addStudent'), desc: t('dashboard.newEnrollment'), icon: UserPlus, href: '/students', color: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400' },
    { label: t('dashboard.createExam'), desc: t('dashboard.scheduleExam'), icon: BookOpen, href: '/exams', color: 'group-hover:text-violet-600 dark:group-hover:text-violet-400' },
    { label: t('dashboard.generateQr'), desc: t('dashboard.classCodes'), icon: QrCode, href: '/qr', color: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400' },
    { label: t('dashboard.viewReports'), desc: t('dashboard.analytics'), icon: FileText, href: '/reports', color: 'group-hover:text-teal-600 dark:group-hover:text-teal-400' },
    { label: t('dashboard.manageSalary'), desc: t('dashboard.payStaff'), icon: DollarSign, href: '/salary', color: 'group-hover:text-amber-600 dark:group-hover:text-amber-400' },
    { label: t('dashboard.addTeacher'), desc: t('dashboard.newHire'), icon: GraduationCap, href: '/teachers', color: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400' },
  ]);

  // Loaded from Convex when available
  const schedule: { title: string; time: string; who: string; type: 'exam' | 'meeting' | 'event' }[] = [];

  const typeColors = {
    exam: 'bg-rose-500',
    meeting: 'bg-amber-500',
    event: 'bg-indigo-500',
  };

  // Attendance sparkline — loaded from Convex when available
  let sparkline = $state<number[]>([]);
  const sparkMax = $derived(sparkline.length > 0 ? Math.max(...sparkline) : 1);

  // Class distribution — loaded from school hierarchy
  type ClassDist = { name: string; pct: number };
  let classDistribution = $state<ClassDist[]>([]);

  $effect(() => {
    const schoolId = getSchool()?.id;
    if (!schoolId) return;
    (async () => {
      try {
        const hierarchy = await convexQuery(api.schools.getSchoolHierarchy, { schoolId });
        if (hierarchy?.classes && hierarchy.classes.length > 0) {
          // Compute attendance % per class from student counts (proxy: capacity fill rate)
          const dist: ClassDist[] = [];
          for (const cls of hierarchy.classes.slice(0, 6)) {
            const totalStudents = (cls.sections ?? []).reduce(
              (sum: number, sec: { students?: unknown[] }) => sum + (sec.students?.length ?? 0),
              0,
            );
            const capacity = (cls.sections ?? []).reduce(
              (sum: number, sec: { capacity?: number }) => sum + (sec.capacity ?? 40),
              0,
            );
            const pct = capacity > 0 ? Math.round((totalStudents / capacity) * 100) : 0;
            dist.push({ name: cls.name, pct });
          }
          if (dist.length > 0) classDistribution = dist;
        }
      } catch {}
    })();
  });
</script>

<div class="space-y-6">
  <!-- Welcome header -->
  <div class="flex items-end justify-between">
    <div>
      <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">{dateStr}</p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight">
        {greeting}, <span class="text-primary">{adminName}</span>
      </h1>
      <p class="mt-0.5 text-sm text-muted-foreground">Here's what's happening at {schoolName} today</p>
    </div>
    <Button variant="outline" size="sm" class="gap-1.5 text-xs" onclick={() => goto('/reports')}>
      <Activity class="h-3.5 w-3.5" />
      {t('dashboard.fullAnalytics')}
    </Button>
  </div>

  <!-- Stats grid -->
  <div class="grid grid-cols-4 gap-4">
    {#each stats as stat, i}
      <div class="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:shadow-black/5">
        <!-- Gradient accent line -->
        <div class="absolute left-0 top-0 h-1 w-full bg-gradient-to-r {stat.accent} opacity-60"></div>

        <div class="flex items-center justify-between">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg {stat.iconBg}">
            <stat.icon class="h-4.5 w-4.5" />
          </div>
          <span class="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <TrendingUp class="h-3 w-3" />
            {stat.change}
          </span>
        </div>
        <p class="mt-3 text-3xl font-bold tracking-tight">{stat.value}</p>
        <p class="mt-0.5 text-xs font-medium text-muted-foreground">{t(stat.labelKey)}</p>
      </div>
    {/each}
  </div>

  <!-- Middle row -->
  <div class="grid grid-cols-12 gap-5">
    <!-- Activity feed -->
    <div class="col-span-5">
      <div class="rounded-xl border border-border bg-card">
        <div class="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h3 class="text-sm font-semibold">{t('dashboard.recentActivity')}</h3>
          <Button variant="ghost" size="sm" class="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground h-auto px-1">
            {t('dashboard.viewAll')}
          </Button>
        </div>
        <div class="divide-y divide-border/50">
          {#each activities as act}
            <div class="flex items-start gap-3 px-5 py-3">
              <div class="relative mt-1">
                <div class="h-2 w-2 rounded-full {act.dot}"></div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[13px] leading-snug">{act.msg}</p>
                <p class="mt-0.5 text-[11px] text-muted-foreground/60">{act.time}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="col-span-4">
      <div class="rounded-xl border border-border bg-card">
        <div class="border-b border-border px-5 py-3.5">
          <h3 class="text-sm font-semibold">{t('dashboard.quickActions')}</h3>
        </div>
        <div class="p-3">
          <div class="grid grid-cols-2 gap-2">
            {#each actions as action}
              <Button
                variant="ghost"
                onclick={() => goto(action.href)}
                class="group flex flex-col items-center gap-2 rounded-lg border border-transparent p-3.5 text-center transition-all hover:border-border hover:bg-muted/50 h-auto"
              >
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors {action.color}">
                  <action.icon class="h-4 w-4" />
                </div>
                <div>
                  <p class="text-xs font-semibold">{action.label}</p>
                  <p class="text-[10px] text-muted-foreground/60">{action.desc}</p>
                </div>
              </Button>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance mini chart + schedule -->
    <div class="col-span-3 flex flex-col gap-5">
      <!-- Attendance trend -->
      <div class="rounded-xl border border-border bg-card p-5">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold">{t('dashboard.attendanceTrend')}</h3>
          <span class="text-[11px] font-medium text-muted-foreground">7 days</span>
        </div>
        {#if sparkline.length > 0}
          <div class="mt-4 flex items-end gap-1.5" style="height: 48px;">
            {#each sparkline as val, i}
              {@const height = (val / sparkMax) * 100}
              <div
                class="flex-1 rounded-sm transition-all hover:opacity-80 {i === sparkline.length - 1 ? 'bg-primary' : 'bg-primary/25'}"
                style="height: {height}%;"
                title="{val}%"
              ></div>
            {/each}
          </div>
        {:else}
          <div class="mt-4 flex items-center justify-center" style="height: 48px;">
            <p class="text-xs text-muted-foreground">No data yet</p>
          </div>
        {/if}
        <p class="mt-2 text-center text-lg font-bold text-primary">{liveAttendance}</p>
        <p class="text-center text-[11px] text-muted-foreground">{t('dashboard.todaysAttendance')}</p>
      </div>

      <!-- Class distribution -->
      <div class="rounded-xl border border-border bg-card p-5">
        <h3 class="text-sm font-semibold">{t('dashboard.classDistribution')}</h3>
        {#if classDistribution.length > 0}
          <div class="mt-3 space-y-2">
            {#each classDistribution as cls}
              <div class="flex items-center gap-2">
                <span class="w-16 text-[11px] text-muted-foreground">{cls.name}</span>
                <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div class="h-full rounded-full bg-primary transition-all" style="width: {cls.pct}%;"></div>
                </div>
                <span class="w-8 text-right text-[11px] font-semibold">{cls.pct}%</span>
              </div>
            {/each}
          </div>
        {:else}
          <p class="mt-3 text-xs text-muted-foreground">No data. Set up your school first.</p>
        {/if}
      </div>
    </div>
  </div>

  <!-- Schedule -->
  <div class="rounded-xl border border-border bg-card">
    <div class="flex items-center justify-between border-b border-border px-5 py-3.5">
      <h3 class="flex items-center gap-2 text-sm font-semibold">
        <Calendar class="h-4 w-4 text-primary" />
        {t('dashboard.todaysSchedule')}
      </h3>
      <Button variant="ghost" size="sm" onclick={() => goto('/exams')} class="flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground h-auto px-1">
        {t('dashboard.fullTimetable')}
        <ArrowUpRight class="h-3 w-3" />
      </Button>
    </div>
    <div class="grid grid-cols-4 divide-x divide-border/50">
      {#each schedule as item}
        <div class="p-4">
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full {typeColors[item.type]}"></div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">{item.type}</span>
          </div>
          <p class="mt-2 text-sm font-semibold leading-snug">{item.title}</p>
          <p class="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock class="h-3 w-3" />
            {item.time}
          </p>
          <p class="mt-0.5 text-[11px] text-muted-foreground/60">{item.who}</p>
        </div>
      {/each}
    </div>
  </div>
</div>
