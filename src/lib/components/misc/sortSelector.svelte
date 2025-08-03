<script lang="ts">
  export interface SortOption {
    value: string;
    label: string;
  }

  let {
    sortField = $bindable(),
    sortOrder = $bindable("desc"),
    options
  }: { sortField: string; sortOrder?: "asc" | "desc"; options: SortOption[] } = $props();
</script>

<div class="flex items-center">
  <label class="text-sm mr-2" for="sortField">Sort by:</label>
  <select
    id="sortField"
    bind:value={sortField}
    class="px-4 py-2 rounded-lg bg-base-200 border border-base-300 mr-2"
    style="width:auto"
  >
    {#each options as { value, label }}
      <option value={value}>{label}</option>
    {/each}
  </select>
  <select
    bind:value={sortOrder}
    class="px-4 py-2 rounded-lg bg-base-200 border border-base-300"
    style="width:auto"
  >
    <option value="desc">Descending</option>
    <option value="asc">Ascending</option>
  </select>
</div>
