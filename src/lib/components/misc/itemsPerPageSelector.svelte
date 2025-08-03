<script lang="ts">
  let {
    itemsPerPage = $bindable(),
    options = [6, 12, 24, 48, 96],
    label = "Items per page"
  }: {
    /** Currently selected number of items shown on each page */
    itemsPerPage: number;
    /** Available item counts to choose from */
    options?: number[];
    /** Label displayed next to the selector */
    label?: string;
  } = $props();
</script>

<div class="flex items-center">
  <label class="text-sm mr-2" for="itemsPerPage">{label}:</label>
  <select
    id="itemsPerPage"
    bind:value={itemsPerPage}
    class="px-7 py-2 rounded-lg bg-base-200 border border-base-300"
    style="width:auto"
  >
    {#each options as option}
      <option value={option}>{option}</option>
    {/each}
  </select>
</div>
