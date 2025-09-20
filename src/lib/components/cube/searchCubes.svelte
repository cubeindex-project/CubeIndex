<script lang="ts">
  let {
    cubes,
    outputVar = $bindable(),
    disabled,
  }: {
    cubes: {
      label: string;
      value: string;
    }[];
    outputVar: string | undefined;
    disabled?: boolean;
  } = $props();

  let search = $state("");
  let searchCubes: {
    label: string;
    value: string;
  }[] = $state([]);

  // whenever allCubes() or search changes, recompute filtered list
  $effect(() => {
    const _ = search;
    searchCubes = cubes.filter((c) =>
      c.label.toLowerCase().includes(search.toLowerCase())
    );
  });
</script>

<input
  type="text"
  placeholder="Search cubes…"
  bind:value={search}
  {disabled}
  class="input w-full mb-2"
  aria-label="Search cubes"
/>

<!-- filtered results list -->
<ul class="border rounded max-h-40 overflow-auto">
  {#if searchCubes.length === 0}
    <li class="p-2 italic">No matches</li>
  {:else if disabled}
    <li class="p-2 italic">Disabled</li>
  {:else}
    {#each searchCubes as c}
      <button
        class="p-2 hover:bg-base-200 cursor-pointer"
        type="button"
        onclick={() => {
          outputVar = c.value;
          search = c.label;
        }}
      >
        {c.label}
      </button>
    {/each}
  {/if}
</ul>
