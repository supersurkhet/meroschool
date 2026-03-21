<script lang="ts">
import { cn } from '$lib/utils'

type Variant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'

const {
	class: className,
	variant = 'default',
	children,
	...rest
}: {
	class?: string
	variant?: Variant
	children?: import('svelte').Snippet
	[key: string]: any
} = $props()

const variantClasses: Record<Variant, string> = {
	default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
	secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
	destructive:
		'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
	outline: 'text-foreground border-border',
	success: 'border-transparent bg-success text-success-foreground hover:bg-success/80',
	warning: 'border-transparent bg-warning text-warning-foreground hover:bg-warning/80',
}
</script>

<div
  class={cn(
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    variantClasses[variant],
    className
  )}
  {...rest}
>
  {@render children?.()}
</div>
