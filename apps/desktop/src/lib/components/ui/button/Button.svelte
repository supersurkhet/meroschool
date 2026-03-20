<script lang="ts">
  import { cn } from "$lib/utils";

  type Variant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  type Size = "default" | "sm" | "lg" | "icon";

  let {
    class: className,
    variant = "default",
    size = "default",
    disabled = false,
    type = "button",
    onclick,
    children,
    ...rest
  }: {
    class?: string;
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    onclick?: (e: MouseEvent) => void;
    children?: import("svelte").Snippet;
    [key: string]: any;
  } = $props();

  const variantClasses: Record<Variant, string> = {
    default:
      "bg-primary text-primary-foreground shadow hover:bg-primary/90 active:bg-primary/80",
    destructive:
      "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/80",
    outline:
      "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
    secondary:
      "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70",
    ghost:
      "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
    link:
      "text-primary underline-offset-4 hover:underline",
  };

  const sizeClasses: Record<Size, string> = {
    default: "h-9 px-4 py-2 text-sm",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8 text-base",
    icon: "h-9 w-9",
  };
</script>

<button
  {type}
  {disabled}
  {onclick}
  class={cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    variantClasses[variant],
    sizeClasses[size],
    className
  )}
  {...rest}
>
  {@render children?.()}
</button>
