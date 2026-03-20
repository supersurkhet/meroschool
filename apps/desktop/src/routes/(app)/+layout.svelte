<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { getIsAuthenticated, getUser, isAdmin, logout } from '$lib/stores/auth.svelte';
  import { getSchool } from '$lib/stores/school.svelte';
  import { toggleTheme, getResolvedTheme } from '$lib/stores/theme.svelte';
  import { t, setLocale, getLocale } from '$lib/i18n/index.svelte';
  import { Button } from '$lib/components/ui/button';
  import {
    LayoutDashboard,
    Settings2,
    Users,
    GraduationCap,
    Heart,
    FileText,
    Wallet,
    BarChart3,
    QrCode,
    Sun,
    Moon,
    LogOut,
    PanelLeftClose,
    PanelLeft,
    School,
    Layers,
    ShieldAlert,
  } from 'lucide-svelte';

  let { children } = $props();

  let accessDenied = $state(false);

  $effect(() => {
    if (!getIsAuthenticated()) {
      goto('/auth', { replaceState: true });
    } else if (!isAdmin()) {
      accessDenied = true;
    }
  });

  let collapsed = $state(false);
  let isDark = $derived(getResolvedTheme() === 'dark');
  let locale = $derived(getLocale());
  let currentPath = $derived($page.url.pathname as string);
  let user = $derived(getUser());

  let userInitials = $derived(
    user?.name
      ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
      : 'SA'
  );

  const navItems = [
    { href: '/dashboard', labelKey: 'nav.dashboard',       icon: LayoutDashboard },
    { href: '/schools',   labelKey: 'nav.schools',          icon: School },
    { href: '/classes',   labelKey: 'nav.classesSections',  icon: Layers },
    { href: '/setup',     labelKey: 'nav.setup',            icon: Settings2 },
    { href: '/students',  labelKey: 'nav.students',         icon: Users },
    { href: '/teachers',  labelKey: 'nav.teachers',         icon: GraduationCap },
    { href: '/parents',   labelKey: 'nav.parents',          icon: Heart },
    { href: '/exams',     labelKey: 'nav.exams',            icon: FileText },
    { href: '/salary',    labelKey: 'nav.salary',           icon: Wallet },
    { href: '/reports',   labelKey: 'nav.reports',          icon: BarChart3 },
    { href: '/qr',        labelKey: 'nav.qr',              icon: QrCode },
  ] as const;

  function isActive(href: string): boolean {
    if (href === '/dashboard') return currentPath === '/dashboard' || currentPath === '/';
    return currentPath.startsWith(href);
  }

  let pageTitle = $derived.by(() => {
    for (const item of navItems) {
      if (isActive(item.href)) return t(item.labelKey);
    }
    return t('common.appName');
  });

  function handleLogout() {
    logout();
    goto('/auth', { replaceState: true });
  }

  function toggleLocale() {
    setLocale(locale === 'en' ? 'ne' : 'en');
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

{#if accessDenied}
<div class="flex h-screen flex-col items-center justify-center gap-4 bg-background text-foreground" style="font-family: 'Instrument Sans', sans-serif;">
  <div class="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
    <ShieldAlert class="h-8 w-8 text-destructive" />
  </div>
  <h1 class="text-2xl font-bold tracking-tight">{t('auth.accessDenied')}</h1>
  <p class="max-w-sm text-center text-sm text-muted-foreground">
    {t('auth.noAdminPrivileges')}
  </p>
  <Button variant="outline" onclick={handleLogout}>
    <LogOut class="mr-2 h-4 w-4" />
    {t('auth.signOut')}
  </Button>
</div>
{:else}
<div class="flex h-screen overflow-hidden bg-background text-foreground" style="font-family: 'Instrument Sans', sans-serif;">
  <!-- Sidebar -->
  <aside
    class="relative flex flex-col border-r border-border/60 bg-card transition-[width] duration-300 ease-in-out"
    style:width={collapsed ? '3.75rem' : '14rem'}
  >
    <!-- Logo -->
    <div class="flex h-14 shrink-0 items-center gap-2.5 border-b border-border/40 px-3">
      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#1a1631] dark:bg-primary/20">
        <span class="text-sm font-bold text-white dark:text-primary" style="font-family: 'DM Serif Display', serif;">म</span>
      </div>
      {#if !collapsed}
        <div class="overflow-hidden">
          <p class="truncate text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40">
            Admin
          </p>
          <p class="truncate text-sm font-bold leading-tight tracking-tight">
            MeroSchool
          </p>
        </div>
      {/if}
    </div>

    <!-- Nav links -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden py-2">
      <ul class="space-y-0.5 px-1.5">
        {#each navItems as item (item.href)}
          {@const active = isActive(item.href)}
          <li>
            <a
              href={item.href}
              title={collapsed ? t(item.labelKey) : undefined}
              class="group flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-all duration-150
                {active
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}"
            >
              <item.icon
                class="h-[15px] w-[15px] shrink-0 transition-transform duration-150
                  {active ? 'text-primary' : 'text-muted-foreground/60 group-hover:text-foreground/70'}"
              />
              {#if !collapsed}
                <span class="truncate">{t(item.labelKey)}</span>
                {#if active}
                  <div class="ml-auto h-1.5 w-1.5 rounded-full bg-primary"></div>
                {/if}
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <!-- Bottom section -->
    <div class="shrink-0 space-y-0.5 border-t border-border/40 px-1.5 py-2">
      <button
        onclick={toggleTheme}
        title={isDark ? 'Light' : 'Dark'}
        class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        {#if isDark}
          <Sun class="h-[15px] w-[15px] shrink-0" />
          {#if !collapsed}<span class="truncate">Light</span>{/if}
        {:else}
          <Moon class="h-[15px] w-[15px] shrink-0" />
          {#if !collapsed}<span class="truncate">Dark</span>{/if}
        {/if}
      </button>

      <button
        onclick={toggleLocale}
        title="Switch language"
        class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <span class="flex h-[15px] w-[15px] shrink-0 items-center justify-center text-[10px] font-bold leading-none">
          {locale === 'en' ? 'ने' : 'EN'}
        </span>
        {#if !collapsed}
          <span class="truncate">
            {locale === 'en' ? 'नेपाली' : 'English'}
          </span>
        {/if}
      </button>

      <!-- User -->
      <div class="mt-1 flex items-center gap-2 rounded-lg px-2.5 py-2">
        <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
          {userInitials}
        </div>
        {#if !collapsed}
          <div class="min-w-0 flex-1">
            <p class="truncate text-[12px] font-semibold">{user?.name ?? 'Admin'}</p>
            <p class="truncate text-[10px] text-muted-foreground/50">{user?.email ?? ''}</p>
          </div>
          <button
            onclick={handleLogout}
            title={t('auth.logout')}
            class="shrink-0 rounded-md p-1 text-muted-foreground/30 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut class="h-3.5 w-3.5" />
          </button>
        {/if}
      </div>
    </div>

    <!-- Collapse toggle -->
    <button
      onclick={() => (collapsed = !collapsed)}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      class="absolute -right-3 top-[3.25rem] z-20 flex h-6 w-6 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground/40 shadow-sm transition-all hover:bg-muted hover:text-foreground"
    >
      {#if collapsed}
        <PanelLeft class="h-3 w-3" />
      {:else}
        <PanelLeftClose class="h-3 w-3" />
      {/if}
    </button>
  </aside>

  <!-- Main content -->
  <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
    <!-- Top bar -->
    <header class="flex h-12 shrink-0 items-center justify-between border-b border-border/40 px-6">
      <div class="flex items-center gap-2 text-[13px]">
        <span class="font-medium text-muted-foreground/40">{getSchool()?.name ?? 'MeroSchool'}</span>
        <span class="text-muted-foreground/20">/</span>
        <span class="font-semibold">{pageTitle}</span>
      </div>
    </header>

    <!-- Page body -->
    <main class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-[1200px] p-6">
        {@render children()}
      </div>
    </main>
  </div>
</div>
{/if}
