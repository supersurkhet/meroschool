<script lang="ts">
import { page } from '$app/stores'
import Button from '$lib/components/ui/button.svelte'
import Card from '$lib/components/ui/card.svelte'
</script>

<div class="flex min-h-[50vh] items-center justify-center p-4">
	<Card class="max-w-md p-8 text-center">
		<div class="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-destructive/10">
			<svg class="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
			</svg>
		</div>
		<h2 class="text-xl font-bold">Dashboard Error</h2>
		<p class="mt-2 text-sm text-muted-foreground">{$page.error?.message ?? "Something went wrong loading this page."}</p>
		<div class="mt-6 flex justify-center gap-3">
			<Button onclick={() => location.reload()}>Retry</Button>
			<a href="/dashboard/teacher"><Button variant="outline">Dashboard Home</Button></a>
		</div>
	</Card>
</div>
