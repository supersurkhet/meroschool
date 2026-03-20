<script lang="ts">
  import { Checkbox } from "bits-ui";
  import { cn } from "$lib/utils";

  let {
    class: className,
    checked = $bindable(false),
    disabled = false,
    required = false,
    indeterminate = $bindable(false),
    name,
    value = "on",
    id,
    onCheckedChange,
    ...rest
  }: {
    class?: string;
    checked?: boolean;
    disabled?: boolean;
    required?: boolean;
    indeterminate?: boolean;
    name?: string;
    value?: string;
    id?: string;
    onCheckedChange?: (checked: boolean | "indeterminate") => void;
    [key: string]: any;
  } = $props();
</script>

<Checkbox.Root
  bind:checked
  bind:indeterminate
  {disabled}
  {required}
  {name}
  {value}
  {id}
  {onCheckedChange}
  class={cn(
    "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
    "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
    className
  )}
  {...rest}
>
  {#snippet children({ checked: isChecked, indeterminate: isIndeterminate })}
    <span class="flex items-center justify-center text-current">
      {#if isIndeterminate}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-3 w-3"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      {:else if isChecked}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-3 w-3"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      {/if}
    </span>
  {/snippet}
</Checkbox.Root>
