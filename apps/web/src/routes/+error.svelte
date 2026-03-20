<script lang="ts">
	import { page } from "$app/stores";
	import Button from "$lib/components/ui/button.svelte";
</script>

<svelte:head>
	<title>Error {$page.status} — MeroSchool</title>
</svelte:head>

<div class="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
	<div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
		<svg class="h-10 w-10 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
		</svg>
	</div>

	<h1 class="text-4xl font-bold text-foreground">{$page.status}</h1>
	<p class="mt-2 text-lg text-muted-foreground">
		{#if $page.status === 404}
			The page you're looking for doesn't exist.
		{:else if $page.status === 500}
			Something went wrong on our end. Please try again.
		{:else}
			{$page.error?.message ?? "An unexpected error occurred."}
		{/if}
	</p>

	<div class="mt-8 flex gap-3">
		<a href="/">
			<Button variant="default">Go Home</Button>
		</a>
		<Button variant="outline" onclick={() => history.back()}>Go Back</Button>
	</div>
</div>
