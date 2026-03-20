<script lang="ts">
  import { goto } from '$app/navigation';
  import { getIsAuthenticated } from '$lib/stores/auth.svelte';
  import { isSetupComplete } from '$lib/stores/school.svelte';
  import PageSkeleton from '$lib/components/PageSkeleton.svelte';

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

<!-- Loading skeleton while redirect resolves -->
<PageSkeleton variant="default" />
