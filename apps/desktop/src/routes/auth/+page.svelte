<script lang="ts">
  import { goto } from '$app/navigation';
  import { login } from '$lib/stores/auth.svelte';
  import { toggleTheme, getResolvedTheme } from '$lib/stores/theme.svelte';
  import { t, setLocale, getLocale } from '$lib/i18n/index.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Sun, Moon, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-svelte';

  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let isLoading = $state(false);
  let errorMessage = $state('');
  let mounted = $state(false);

  let isDark = $derived(getResolvedTheme() === 'dark');
  let locale = $derived(getLocale());

  $effect(() => {
    mounted = true;
  });

  async function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    errorMessage = '';
    isLoading = true;
    try {
      await login(email, password);
      goto('/dashboard', { replaceState: true });
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : 'Login failed.';
    } finally {
      isLoading = false;
    }
  }

  function toggleLocale() {
    setLocale(locale === 'en' ? 'ne' : 'en');
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="relative flex min-h-screen overflow-hidden" style="font-family: 'Instrument Sans', sans-serif;">
  <!-- Left panel — brand / visual -->
  <div class="relative hidden w-[55%] flex-col justify-between overflow-hidden bg-[#1a1631] p-10 lg:flex">
    <!-- Geometric mandala pattern -->
    <svg class="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="mandala-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M40 0L80 40L40 80L0 40Z" fill="none" stroke="white" stroke-width="0.5"/>
          <circle cx="40" cy="40" r="20" fill="none" stroke="white" stroke-width="0.3"/>
          <circle cx="40" cy="40" r="8" fill="none" stroke="white" stroke-width="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mandala-grid)"/>
    </svg>

    <!-- Warm gradient wash -->
    <div class="pointer-events-none absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-[#c2410c] opacity-[0.06] blur-[120px]"></div>
    <div class="pointer-events-none absolute -right-1/4 -top-1/4 h-[500px] w-[500px] rounded-full bg-[#4338ca] opacity-[0.08] blur-[100px]"></div>

    <!-- Top brand mark -->
    <div class="relative z-10 {mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700 delay-100">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5">
          <span class="text-lg font-bold text-white" style="font-family: 'DM Serif Display', serif;">म</span>
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">Administration</p>
          <p class="text-sm font-semibold text-white/80">MeroSchool</p>
        </div>
      </div>
    </div>

    <!-- Center hero text -->
    <div class="relative z-10 max-w-md {mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} transition-all duration-700 delay-300">
      <p class="mb-4 text-[10px] font-bold uppercase tracking-[0.4em] text-amber-400/70">
        School Management Platform
      </p>
      <h1 class="text-5xl leading-[1.1] tracking-tight text-white" style="font-family: 'DM Serif Display', serif;">
        Every student's<br/>
        <span class="text-amber-300/90">journey</span> begins<br/>
        with great<br/>
        management.
      </h1>
      <div class="mt-8 h-px w-20 bg-gradient-to-r from-amber-400/60 to-transparent"></div>
      <p class="mt-6 text-sm leading-relaxed text-white/40">
        Enrollment, attendance, examinations, salary management — everything your school needs, unified in one desktop application.
      </p>
    </div>

    <!-- Bottom stats row -->
    <div class="relative z-10 flex gap-10 {mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700 delay-500">
      {#each [
        { n: '500+', l: 'Students managed' },
        { n: '30+', l: 'Teachers empowered' },
        { n: '12', l: 'Subjects tracked' },
      ] as s}
        <div>
          <p class="text-2xl font-bold text-white/90" style="font-family: 'DM Serif Display', serif;">{s.n}</p>
          <p class="text-[11px] text-white/30">{s.l}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Right panel — login form -->
  <div class="flex flex-1 flex-col bg-background">
    <!-- Top bar -->
    <div class="flex items-center justify-end gap-2 p-5">
      <button
        onclick={toggleLocale}
        class="h-8 rounded-full border border-border bg-muted/50 px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted"
      >
        {locale === 'en' ? 'नेपाली' : 'English'}
      </button>
      <button
        onclick={toggleTheme}
        class="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted/50 text-muted-foreground transition-colors hover:bg-muted"
      >
        {#if isDark}
          <Sun class="h-3.5 w-3.5" />
        {:else}
          <Moon class="h-3.5 w-3.5" />
        {/if}
      </button>
    </div>

    <!-- Centered form -->
    <div class="flex flex-1 items-center justify-center px-6">
      <div class="w-full max-w-[360px] {mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-500 delay-200">
        <!-- Heading -->
        <div class="mb-8">
          <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
            {t('auth.adminPanel')}
          </p>
          <h2 class="mt-2 text-3xl font-bold tracking-tight" style="font-family: 'DM Serif Display', serif;">
            {t('auth.welcomeBack')}
          </h2>
          <p class="mt-2 text-sm text-muted-foreground">
            {t('auth.signIn')}
          </p>
        </div>

        <form onsubmit={handleLogin} class="space-y-5">
          <div class="space-y-1.5">
            <Label class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t('common.email')}
            </Label>
            <Input
              type="email"
              placeholder="admin@school.edu.np"
              bind:value={email}
              required
              disabled={isLoading}
              class="h-11 rounded-lg border-border/60 bg-muted/30 transition-colors focus-visible:bg-background"
            />
          </div>

          <div class="space-y-1.5">
            <Label class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t('common.password')}
            </Label>
            <div class="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                bind:value={password}
                required
                disabled={isLoading}
                class="h-11 rounded-lg border-border/60 bg-muted/30 pr-10 transition-colors focus-visible:bg-background"
              />
              <button
                type="button"
                onclick={() => (showPassword = !showPassword)}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 transition-colors hover:text-muted-foreground"
                tabindex={-1}
              >
                {#if showPassword}
                  <EyeOff class="h-4 w-4" />
                {:else}
                  <Eye class="h-4 w-4" />
                {/if}
              </button>
            </div>
          </div>

          {#if errorMessage}
            <div class="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle class="h-4 w-4 shrink-0" />
              {errorMessage}
            </div>
          {/if}

          <Button
            type="submit"
            disabled={isLoading}
            class="group h-11 w-full rounded-lg bg-[#1a1631] font-semibold text-white shadow-lg shadow-[#1a1631]/20 transition-all hover:bg-[#241f42] hover:shadow-xl hover:shadow-[#1a1631]/30 disabled:opacity-60 dark:bg-primary dark:hover:bg-primary/90"
          >
            {#if isLoading}
              <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              <span class="ml-2">{t('common.loading')}</span>
            {:else}
              {t('auth.login')}
              <ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            {/if}
          </Button>
        </form>

        <!-- Footer -->
        <div class="mt-10 flex items-center gap-3">
          <div class="h-px flex-1 bg-border/50"></div>
          <span class="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40">
            MeroSchool Desktop v1.0
          </span>
          <div class="h-px flex-1 bg-border/50"></div>
        </div>
      </div>
    </div>
  </div>
</div>
