<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    resetFilters: () => void;
  }

  let { children, resetFilters }: Props = $props();
</script>

<div class="drawer-side top-16 xl:h-[calc(100dvh-4rem)]">
  <label for="filter-drawer" aria-label="close sidebar" class="drawer-overlay"
  ></label>
  <aside
    class="flex flex-col min-h-full min-w-80 bg-base-200 gap-2 p-6 xl:h-full xl:overflow-y-auto"
  >
    <div>
      <span class="font-bold text-lg">Filters</span>
    </div>
    <div class="flex flex-col gap-4">
      {@render children()}
      <button
        class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border cursor-pointer hover:bg-neutral hover:text-neutral-content"
        onclick={resetFilters}
        type="button"
      >
        <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
        Reset Filters
      </button>
    </div>
  </aside>
</div>
