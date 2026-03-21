<script lang="ts">
import { cn } from '$lib/utils'

const {
	class: className,
	src,
	alt = '',
	onload,
	onerror,
	...rest
}: {
	class?: string
	src?: string
	alt?: string
	onload?: (e: Event) => void
	onerror?: (e: Event) => void
	[key: string]: any
} = $props()

let loaded = $state(false)
let errored = $state(false)

function handleLoad(e: Event) {
	loaded = true
	onload?.(e)
}

function handleError(e: Event) {
	errored = true
	onerror?.(e)
}
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<img
  {src}
  {alt}
  onload={handleLoad}
  onerror={handleError}
  class={cn(
    "aspect-square h-full w-full object-cover",
    (!loaded || errored) && "hidden",
    className
  )}
  {...rest}
/>
