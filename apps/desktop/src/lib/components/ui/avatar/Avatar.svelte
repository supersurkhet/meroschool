<script lang="ts">
  import { cn } from "$lib/utils";

  let {
    class: className,
    children,
    ...rest
  }: {
    class?: string;
    children?: import("svelte").Snippet;
    [key: string]: any;
  } = $props();
</script>

<span
  class={cn(
    "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
    className
  )}
  {...rest}
>
  {@render children?.()}
</span>
