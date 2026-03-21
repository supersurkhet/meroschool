<script lang="ts">
import { Skeleton } from '$lib/components/ui/skeleton'

const { variant = 'default' }: { variant?: 'default' | 'table' | 'cards' | 'form' } = $props()
</script>

{#if variant === 'default'}
  <!-- Header -->
  <div class="flex flex-col gap-6 p-6">
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-2">
        <Skeleton class="h-7 w-48" />
        <Skeleton class="h-4 w-72" />
      </div>
      <Skeleton class="h-9 w-28" />
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {#each { length: 4 } as _}
        <div class="flex flex-col gap-3 rounded-lg border bg-card p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <Skeleton class="h-4 w-24" />
            <Skeleton class="h-8 w-8 rounded-full" />
          </div>
          <Skeleton class="h-8 w-20" />
          <Skeleton class="h-3 w-32" />
        </div>
      {/each}
    </div>

    <!-- Content area -->
    <div class="flex flex-col gap-3 rounded-lg border bg-card p-5 shadow-sm">
      <div class="flex items-center justify-between">
        <Skeleton class="h-5 w-36" />
        <Skeleton class="h-8 w-24" />
      </div>
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-5/6" />
      <Skeleton class="h-4 w-4/6" />
      <Skeleton class="mt-2 h-48 w-full" />
    </div>
  </div>

{:else if variant === 'table'}
  <!-- Header -->
  <div class="flex flex-col gap-6 p-6">
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-2">
        <Skeleton class="h-7 w-40" />
        <Skeleton class="h-4 w-60" />
      </div>
      <Skeleton class="h-9 w-28" />
    </div>

    <!-- Filter bar -->
    <div class="flex items-center gap-3">
      <Skeleton class="h-9 w-64" />
      <Skeleton class="h-9 w-32" />
      <Skeleton class="h-9 w-32" />
      <div class="ml-auto">
        <Skeleton class="h-9 w-24" />
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-lg border bg-card shadow-sm">
      <!-- Table header -->
      <div class="flex items-center gap-4 border-b px-4 py-3">
        <Skeleton class="h-4 w-4" />
        <Skeleton class="h-4 w-32" />
        <Skeleton class="ml-auto h-4 w-24" />
        <Skeleton class="h-4 w-20" />
        <Skeleton class="h-4 w-16" />
        <Skeleton class="h-4 w-8" />
      </div>
      <!-- Table rows -->
      {#each { length: 8 } as _}
        <div class="flex items-center gap-4 border-b px-4 py-3 last:border-0">
          <Skeleton class="h-4 w-4" />
          <div class="flex items-center gap-3">
            <Skeleton class="h-8 w-8 rounded-full" />
            <div class="flex flex-col gap-1">
              <Skeleton class="h-4 w-28" />
              <Skeleton class="h-3 w-36" />
            </div>
          </div>
          <Skeleton class="ml-auto h-4 w-20" />
          <Skeleton class="h-6 w-16 rounded-full" />
          <Skeleton class="h-4 w-14" />
          <Skeleton class="h-8 w-8 rounded-md" />
        </div>
      {/each}
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <Skeleton class="h-4 w-40" />
      <div class="flex items-center gap-2">
        <Skeleton class="h-8 w-8 rounded-md" />
        <Skeleton class="h-8 w-8 rounded-md" />
        <Skeleton class="h-8 w-8 rounded-md" />
        <Skeleton class="h-8 w-8 rounded-md" />
      </div>
    </div>
  </div>

{:else if variant === 'cards'}
  <!-- Header -->
  <div class="flex flex-col gap-6 p-6">
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-2">
        <Skeleton class="h-7 w-44" />
        <Skeleton class="h-4 w-64" />
      </div>
      <div class="flex items-center gap-2">
        <Skeleton class="h-9 w-24" />
        <Skeleton class="h-9 w-28" />
      </div>
    </div>

    <!-- Cards grid -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each { length: 6 } as _}
        <div class="flex flex-col gap-4 rounded-lg border bg-card p-5 shadow-sm">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <Skeleton class="h-10 w-10 rounded-full" />
              <div class="flex flex-col gap-1.5">
                <Skeleton class="h-5 w-28" />
                <Skeleton class="h-3.5 w-20" />
              </div>
            </div>
            <Skeleton class="h-6 w-16 rounded-full" />
          </div>
          <Skeleton class="h-px w-full" />
          <div class="flex flex-col gap-2">
            <Skeleton class="h-3.5 w-full" />
            <Skeleton class="h-3.5 w-4/5" />
          </div>
          <div class="flex items-center justify-between pt-1">
            <Skeleton class="h-4 w-24" />
            <Skeleton class="h-8 w-20 rounded-md" />
          </div>
        </div>
      {/each}
    </div>
  </div>

{:else if variant === 'form'}
  <!-- Header -->
  <div class="flex flex-col gap-6 p-6">
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-2">
        <Skeleton class="h-7 w-36" />
        <Skeleton class="h-4 w-56" />
      </div>
    </div>

    <!-- Form -->
    <div class="flex flex-col gap-6 rounded-lg border bg-card p-6 shadow-sm">
      <!-- Two-column row -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {#each { length: 2 } as _}
          <div class="flex flex-col gap-2">
            <Skeleton class="h-4 w-24" />
            <Skeleton class="h-9 w-full rounded-md" />
          </div>
        {/each}
      </div>

      <!-- Full-width fields -->
      {#each { length: 2 } as _}
        <div class="flex flex-col gap-2">
          <Skeleton class="h-4 w-28" />
          <Skeleton class="h-9 w-full rounded-md" />
        </div>
      {/each}

      <!-- Textarea field -->
      <div class="flex flex-col gap-2">
        <Skeleton class="h-4 w-20" />
        <Skeleton class="h-24 w-full rounded-md" />
      </div>

      <!-- Another two-column row -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {#each { length: 2 } as _}
          <div class="flex flex-col gap-2">
            <Skeleton class="h-4 w-20" />
            <Skeleton class="h-9 w-full rounded-md" />
          </div>
        {/each}
      </div>

      <!-- Form actions -->
      <div class="flex items-center justify-end gap-3 border-t pt-4">
        <Skeleton class="h-9 w-20 rounded-md" />
        <Skeleton class="h-9 w-24 rounded-md" />
      </div>
    </div>
  </div>
{/if}
