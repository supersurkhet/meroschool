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

<p
  class={cn("text-sm text-muted-foreground", className)}
  {...rest}
>
  {@render children?.()}
</p>
