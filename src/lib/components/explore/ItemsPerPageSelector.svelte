<script lang="ts">
  interface Props {
    itemsPerPage: number;
    options?: number[];
    label?: string;
  }

  let {
    itemsPerPage = $bindable(),
    options = [6, 12, 24, 48, 96],
    label = "Items per page",
  }: Props = $props();
</script>

<div class="flex items-center">
  <label class="text-sm mr-2" for="itemsPerPage">{label}:</label>
  <select id="itemsPerPage" bind:value={itemsPerPage} class="select w-auto">
    {#each options as option, index (index)}
      <option value={option}>{option}</option>
    {/each}
  </select>
</div>
