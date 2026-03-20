<script lang="ts">
  let { value = $bindable(), class: className = '', children, ...rest }: {
    value?: string;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  } = $props();
</script>

<select
  bind:value
  class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 {className}"
  {...rest}
>
  {@render children?.()}
</select>
