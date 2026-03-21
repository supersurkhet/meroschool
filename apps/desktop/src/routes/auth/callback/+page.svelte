<script lang="ts">
import { goto } from '$app/navigation'
import { page } from '$app/stores'
import { exchangeCodeForUser } from '$lib/stores/auth.svelte'
import { AlertCircle } from 'lucide-svelte'

let error = $state('')
let status = $state<'exchanging' | 'success' | 'error'>('exchanging')

$effect(() => {
	const code = $page.url.searchParams.get('code')
	if (!code) {
		error = 'No authorization code received. Please try logging in again.'
		status = 'error'
		return
	}

	;(async () => {
		try {
			await exchangeCodeForUser(code)
			status = 'success'
			// Small delay so user sees success state
			setTimeout(() => goto('/dashboard', { replaceState: true }), 500)
		} catch (err) {
			error = err instanceof Error ? err.message : 'Authentication failed.'
			status = 'error'
		}
	})()
})
</script>

<div class="flex min-h-screen items-center justify-center bg-background">
  <div class="w-full max-w-sm text-center">
    {#if status === 'exchanging'}
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-3 border-primary border-t-transparent"></div>
        <p class="text-sm font-medium text-muted-foreground">Completing sign in...</p>
      </div>
    {:else if status === 'success'}
      <div class="flex flex-col items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
          <svg class="h-6 w-6 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p class="text-sm font-medium">Signed in successfully. Redirecting...</p>
      </div>
    {:else}
      <div class="flex flex-col items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle class="h-6 w-6 text-destructive" />
        </div>
        <div>
          <p class="text-sm font-semibold text-destructive">Authentication Failed</p>
          <p class="mt-1 text-xs text-muted-foreground">{error}</p>
        </div>
        <a
          href="/auth"
          class="mt-2 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try Again
        </a>
      </div>
    {/if}
  </div>
</div>
