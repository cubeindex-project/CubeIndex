<script lang="ts">
  /**
   * Public sort option for field dropdown.
   * Use with SortSelector by passing an array of these.
   */
  export interface SortFieldOption {
    /** Unique value for the field (e.g. "name", "recent"). */
    value: string;
    /** Human-friendly label for the option. */
    label: string;
  }

  /**
   * A compact sort selector with a field dropdown and a toggle for direction,
   * matching the profile cubes page UX (select + up/down icon button).
   */
  let {
    /** The current sort field value. */
    sortField = $bindable("name"),
    /** The current sort direction. */
    sortOrder = $bindable<"asc" | "desc">("asc"),
    /** List of available fields. */
    fields,
    /** Optional: called on any user change (field or direction). */
    useronchange = () => {},
    /** Optional id for the select element. */
    id = "sortBy",
    /** Optional label text. */
    label = "Sort",
  }: {
    sortField: string;
    sortOrder: "asc" | "desc";
    fields: SortFieldOption[];
    useronchange?: () => void;
    id?: string;
    label?: string;
  } = $props();

  function toggleDir() {
    sortOrder = sortOrder === "desc" ? "asc" : "desc";
  }
</script>

<div class="flex items-center gap-2">
  <label class="text-sm" for={id}>{label}</label>
  <select
    id={id}
    class="select select-bordered"
    bind:value={sortField}
    onchange={useronchange}
  >
    {#each fields as f}
      <option value={f.value}>{f.label}</option>
    {/each}
  </select>
  <button
    type="button"
    class="btn btn-ghost btn-sm"
    title={sortOrder === "desc" ? "Descending" : "Ascending"}
    aria-label="Toggle sort direction"
    onclick={() => {
      toggleDir();
      useronchange();
    }}
  >
    {#if sortOrder === "desc"}
      <i class="fa-solid fa-arrow-down-wide-short"></i>
    {:else}
      <i class="fa-solid fa-arrow-up-short-wide"></i>
    {/if}
  </button>
</div>
