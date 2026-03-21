<script lang="ts">
import { cn } from '$lib/utils'

const {
	class: className,
	children,
	...rest
}: {
	class?: string
	children?: import('svelte').Snippet
	[key: string]: any
} = $props()
</script>

<span
  class={cn(
    "flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium",
    className
  )}
  {...rest}
>
  {@render children?.()}
</span>
