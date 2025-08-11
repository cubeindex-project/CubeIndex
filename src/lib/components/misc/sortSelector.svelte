<script lang="ts">
  export interface SortOption {
    id: string;
    field: string;
    order: "asc" | "desc";
    label: string;
  }

  let {
    sortField = $bindable("name"),
    sortOrder = $bindable("asc"),
    sortOptions
  }: {
    sortField: string;
    sortOrder: "asc" | "desc";
    sortOptions: SortOption[];
  } = $props();

  // Which option should appear selected based on current field/order?
  let selectedId = $derived(() =>
    sortOptions.find(o => o.field === sortField && o.order === sortOrder)?.id
      ?? sortOptions[0]?.id
  );

  function onChange(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    const opt = sortOptions.find(o => o.id === id);
    if (opt) {
      // safe: runs in an event handler, not during render
      sortField = opt.field;
      sortOrder = opt.order;
    }
  }
</script>

<div class="flex items-center">
  <label class="text-sm mr-2" for="sortField">Sort by:</label>
  <select
    id="sortField"
    bind:value={selectedId}
    onchange={onChange}
    class="select"
    style="width:auto"
  >
    {#each sortOptions as o}
      <option value={o.id}>{o.label}</option>
    {/each}
  </select>
</div>
