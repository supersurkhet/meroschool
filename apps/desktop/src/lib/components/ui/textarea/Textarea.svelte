<script lang="ts">
import { cn } from '$lib/utils'

let {
	class: className,
	placeholder,
	value = $bindable(),
	disabled = false,
	readonly = false,
	required = false,
	rows = 4,
	id,
	name,
	...rest
}: {
	class?: string
	placeholder?: string
	value?: string
	disabled?: boolean
	readonly?: boolean
	required?: boolean
	rows?: number
	id?: string
	name?: string
	[key: string]: any
} = $props()
</script>

<textarea
  {placeholder}
  {disabled}
  {readonly}
  {required}
  {rows}
  {id}
  {name}
  bind:value
  class={cn(
    "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
    "placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "resize-y",
    className
  )}
  {...rest}
></textarea>
