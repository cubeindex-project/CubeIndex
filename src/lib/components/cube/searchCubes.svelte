<script lang="ts">
    import Fuse from "fuse.js";

    export interface SearchCube {
      label: string;
      value: string;
    }

  let {
    cubes,
    outputVar = $bindable(),
    disabled,
  }: {
    cubes: SearchCube[];
    outputVar: string | undefined;
    disabled?: boolean;
  } = $props();



    const fuse = $derived.by(
      () =>
        new Fuse(cubes, {
          keys: ["label"],
          threshold: 0.4,
          ignoreLocation: true,
        })
    );

  let search = $state("");
  let searchCubes: {
    label: string;
    value: string;
  }[] = $derived(search ? fuse.search(search).map((r) => r.item) : cubes);
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
  {#if disabled}
    <li class="p-2 italic">Disabled</li>
    {:else if searchCubes.length === 0}
      <li class="p-2 italic">No matches</li>
  {:else}
    {#each searchCubes as c (c.value)}
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
