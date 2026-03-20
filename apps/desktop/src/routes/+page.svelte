<script lang="ts">
  import { goto } from '$app/navigation';
  import { getIsAuthenticated } from '$lib/stores/auth.svelte';
  import { isSetupComplete } from '$lib/stores/school.svelte';

  // On mount, check auth state and redirect accordingly.
  $effect(() => {
    if (getIsAuthenticated()) {
      if (isSetupComplete()) {
        goto('/dashboard', { replaceState: true });
      } else {
        goto('/setup', { replaceState: true });
      }
    } else {
      goto('/auth', { replaceState: true });
    }
  });
</script>

<!-- Blank while redirect resolves -->
<div class="flex h-screen items-center justify-center bg-background">
  <div class="flex flex-col items-center gap-3">
    <div
      class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
    ></div>
    <p class="text-sm text-muted-foreground">Loading…</p>
  </div>
</div>
