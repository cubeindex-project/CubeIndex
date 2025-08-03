<script lang="ts">
  import { blur } from "svelte/transition";
  import type { Snippet } from "svelte";
  let {
    showFilters,
    asideClass = "",
    wrapperClass = "top-7",
    children,
  }: {
    showFilters: boolean;
    asideClass?: string;
    wrapperClass?: string;
    children: Snippet;
  } = $props();
</script>

{#if showFilters}
  <aside class={`w-full lg:w-70 ${asideClass}`.trim()}>
    <div
      class={`bg-base-200 border border-base-300 rounded-2xl p-6 sticky ${wrapperClass}`.trim()}
      transition:blur
    >
      <div class="flex items-center justify-between mb-4">
        <span class="font-semibold text-lg">Filters</span>
      </div>
      <div class="flex flex-col gap-4">
        {@render children()}
      </div>
    </div>
  </aside>
{/if}
