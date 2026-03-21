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

<div
  class={cn("flex items-center p-6 pt-0", className)}
  {...rest}
>
  {@render children?.()}
</div>
