<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { AlertCircle, RefreshCw } from 'lucide-svelte';

  let { children } = $props();
  let error = $state<Error | null>(null);

  function handleError(e: Error) {
    error = e;
  }

  function retry() {
    error = null;
  }
</script>

{#if error}
  <div class="flex h-full min-h-[200px] w-full items-center justify-center p-6">
    <div class="flex max-w-md flex-col items-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center shadow-sm">
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle class="h-6 w-6 text-destructive" />
      </div>
      <div class="flex flex-col gap-1">
        <h2 class="text-lg font-semibold tracking-tight">Something went wrong</h2>
        <p class="text-sm text-muted-foreground">{error.message}</p>
      </div>
      <Button variant="outline" size="sm" onclick={retry} class="gap-2">
        <RefreshCw class="h-4 w-4" />
        Try Again
      </Button>
    </div>
  </div>
{:else}
  {@render children()}
{/if}
