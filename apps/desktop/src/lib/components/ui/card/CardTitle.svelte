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

<h3
  class={cn("font-semibold leading-none tracking-tight text-lg", className)}
  {...rest}
>
  {@render children?.()}
</h3>
