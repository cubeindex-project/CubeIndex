<script lang="ts">
  export interface SortFieldOption {
    value: string;
    label: string;
  }

  export type SortDirection = "asc" | "desc";

  interface Props {
    fields: readonly SortFieldOption[];
    defaultField: string;
    sortField: string | null;
    sortOrder: SortDirection;
    label?: string;
  }

  let {
    fields,
    defaultField,
    sortField = $bindable<string | null>(defaultField),
    sortOrder = $bindable<SortDirection>("asc"),
    label = "Sort",
  }: Props = $props();

  function toggleSortDirection() {
    sortOrder = sortOrder === "desc" ? "asc" : "desc";
  }
</script>

<div class="flex items-center gap-2">
  <label class="text-sm" for="sortBy">{label}</label>
  <select
    id="sortBy"
    class="select select-bordered"
    value={sortField ?? defaultField}
    onchange={(event) => {
      sortField = event.currentTarget.value;
    }}
  >
    {#each fields as f, index (index)}
      <option value={f.value}>{f.label}</option>
    {/each}
  </select>
  <button
    type="button"
    class="btn btn-ghost btn-sm"
    title={sortOrder === "desc" ? "Descending" : "Ascending"}
    aria-label="Toggle sort direction"
    onclick={toggleSortDirection}
  >
    {#if sortOrder === "desc"}
      <i class="fa-solid fa-arrow-down-wide-short"></i>
    {:else}
      <i class="fa-solid fa-arrow-up-short-wide"></i>
    {/if}
  </button>
</div>
