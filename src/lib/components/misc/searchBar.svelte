<script lang="ts">
  let {
    placeholderLabel = "",
    showFilter,
    filterAction = () => {},
    searchTerm = $bindable(),
    oninput = () => {},
  }: {
    placeholderLabel?: string;
    showFilter: boolean;
    filterAction?: () => void;
    searchTerm: string;
    oninput?: () => void;
  } = $props();
</script>

<div class="flex items-center mb-6">
  {#if showFilter}
    <button
      class="flex-shrink-0 h-12.5 px-4 rounded-l-xl cursor-pointer bg-base-200 border border-base-300 border-r-0 transition flex items-center"
      aria-label="Toggle Filters"
      onclick={filterAction}
      type="button"
      style="border-top-right-radius:0; border-bottom-right-radius:0;"
      {oninput}
    >
      <i class="fa-solid fa-sliders"></i>
    </button>
  {/if}
  <div class="relative flex-1">
    <input
      type="text"
      placeholder={placeholderLabel}
      bind:value={searchTerm}
      class="input bg-base-200 w-full h-12.5 {showFilter
        ? 'rounded-l-none'
        : ''} border-base-300"
    />
    {#if searchTerm.length}
      <button
        type="button"
        class="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
        onclick={() => (searchTerm = "")}
        aria-label="Clear"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>
    {/if}
  </div>
</div>
