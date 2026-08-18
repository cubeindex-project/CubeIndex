<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    title: string;
    message: string;
    icon: string;

    action?: Snippet;
    resetFilters: () => void;
  }

  const { title, message, icon, action, resetFilters }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-20">
  <i class="{icon} fa-3x mb-4"></i>
  <h2 class="text-2xl font-semibold mb-2">{title}</h2>
  <p class="mb-6 text-center max-w-xs">
    {message}
  </p>
  <div class="flex flex-col justify-center gap-4">
    {#if action}
      {@render action()}
    {/if}
    <button
      onclick={() => resetFilters()}
      class="btn btn-outline flex items-center"
      aria-label="Reset filters"
    >
      <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
      Reset Filters
    </button>
  </div>
</div>
