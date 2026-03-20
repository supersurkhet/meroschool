<script lang="ts">
  import { cn } from "$lib/utils";

  let {
    class: className,
    orientation = "horizontal",
    decorative = true,
    ...rest
  }: {
    class?: string;
    orientation?: "horizontal" | "vertical";
    decorative?: boolean;
    [key: string]: any;
  } = $props();
</script>

<div
  role={decorative ? "none" : "separator"}
  aria-orientation={decorative ? undefined : orientation}
  class={cn(
    "shrink-0 bg-border",
    orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
    className
  )}
  {...rest}
></div>
