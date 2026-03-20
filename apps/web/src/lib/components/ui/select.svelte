<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLSelectAttributes } from "svelte/elements";

	interface Props extends HTMLSelectAttributes {
		children: Snippet;
		class?: string;
		value?: string | number;
	}

	let { children, class: className, value = $bindable(""), ...rest }: Props = $props();
</script>

<select
	class={cn(
		"flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
	bind:value
	{...rest}
>
	{@render children()}
</select>
