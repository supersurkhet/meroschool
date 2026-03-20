<script lang="ts">
  import { cn } from "$lib/utils";

  let {
    class: className,
    for: htmlFor,
    children,
    ...rest
  }: {
    class?: string;
    for?: string;
    children?: import("svelte").Snippet;
    [key: string]: any;
  } = $props();
</script>

<label
  for={htmlFor}
  class={cn(
    "text-sm font-medium leading-none",
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    className
  )}
  {...rest}
>
  {@render children?.()}
</label>
