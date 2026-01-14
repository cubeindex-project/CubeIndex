<script lang="ts">
    import { m } from "$lib/paraglide/messages";
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
  placeholder={m.cube_search_placeholder()}
  bind:value={search}
  {disabled}
  class="input w-full mb-2"
  aria-label={m.cube_search_aria()}
/>

<!-- filtered results list -->
<ul class="border rounded max-h-40 overflow-auto">
  {#if disabled}
    <li class="p-2 italic">{m.cube_search_disabled_text()}</li>
    {:else if searchCubes.length === 0}
      <li class="p-2 italic">{m.cube_search_no_matches_text()}</li>
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
