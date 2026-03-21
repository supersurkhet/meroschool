<script lang="ts">
import { cn } from '$lib/utils.js'
import type { HTMLTextareaAttributes } from 'svelte/elements'

interface Props extends HTMLTextareaAttributes {
	class?: string
	value?: string
}

let { class: className, value = $bindable(''), ...rest }: Props = $props()
</script>

<textarea
	class={cn(
		"flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
	bind:value
	{...rest}
></textarea>
