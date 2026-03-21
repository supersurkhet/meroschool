<script lang="ts">
import { cn } from '$lib/utils.js'
import type { Snippet } from 'svelte'

interface Props {
	variant?: 'default' | 'secondary' | 'outline' | 'accent'
	children: Snippet
	class?: string
}

const { variant = 'default', children, class: className }: Props = $props()

const variants: Record<string, string> = {
	default: 'bg-primary text-primary-foreground',
	secondary: 'bg-secondary text-secondary-foreground',
	outline: 'border border-border text-foreground',
	accent: 'bg-accent/10 text-accent border border-accent/20',
}
</script>

<span class={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)}>
	{@render children()}
</span>
