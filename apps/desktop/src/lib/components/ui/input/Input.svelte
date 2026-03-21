<script lang="ts">
import { cn } from '$lib/utils'

let {
	class: className,
	type = 'text',
	placeholder,
	value = $bindable(),
	disabled = false,
	readonly = false,
	required = false,
	id,
	name,
	...rest
}: {
	class?: string
	type?: string
	placeholder?: string
	value?: string | number
	disabled?: boolean
	readonly?: boolean
	required?: boolean
	id?: string
	name?: string
	[key: string]: any
} = $props()
</script>

<input
  {type}
  {placeholder}
  {disabled}
  {readonly}
  {required}
  {id}
  {name}
  bind:value
  class={cn(
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
    "transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:cursor-not-allowed disabled:opacity-50",
    className
  )}
  {...rest}
/>
