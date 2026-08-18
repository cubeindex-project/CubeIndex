<script lang="ts">
  interface Props {
    searchTerm: string;
    showFilterToggle: boolean;
    placeholder?: string;
  }

  let {
    searchTerm = $bindable(),
    showFilterToggle,
    placeholder = "",
  }: Props = $props();
</script>

<div class="flex items-center gap-2 w-full mb-6">
  {#if showFilterToggle}
    <label for="filter-drawer" class="btn drawer-button xl:hidden">
      <i class="fa-solid fa-sliders"></i>
    </label>
  {/if}
  <div class="join w-full">
    <input
      type="text"
      {placeholder}
      bind:value={searchTerm}
      class="input w-full join-item"
    />
    {#if searchTerm.length}
      <button
        type="button"
        class="btn join-item"
        onclick={() => (searchTerm = "")}
        aria-label="Clear"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>
    {/if}
  </div>
</div>
