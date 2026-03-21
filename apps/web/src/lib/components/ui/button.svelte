<script lang="ts">
import { cn } from '$lib/utils.js'
import type { Snippet } from 'svelte'
import type { HTMLButtonAttributes } from 'svelte/elements'

interface Props extends HTMLButtonAttributes {
	variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'accent'
	size?: 'default' | 'sm' | 'lg' | 'icon'
	children: Snippet
	class?: string
}

const {
	variant = 'default',
	size = 'default',
	children,
	class: className,
	...rest
}: Props = $props()

const variants: Record<string, string> = {
	default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
	secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
	outline:
		'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
	ghost: 'hover:bg-accent/10 hover:text-accent-foreground',
	destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
	link: 'text-primary underline-offset-4 hover:underline',
	accent: 'bg-accent text-accent-foreground shadow-sm hover:bg-accent/90',
}

const sizes: Record<string, string> = {
	default: 'h-9 px-4 py-2',
	sm: 'h-8 rounded-md px-3 text-xs',
	lg: 'h-11 rounded-md px-8 text-base',
	icon: 'h-9 w-9',
}
</script>

<button
	class={cn(
		"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
		variants[variant],
		sizes[size],
		className
	)}
	{...rest}
>
	{@render children()}
</button>
