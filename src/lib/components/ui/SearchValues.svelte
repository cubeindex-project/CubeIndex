<script lang="ts" generics="T">
  import Fuse from "fuse.js";

  export interface SearchValue<T> {
    image_url?: string;
    label: string;
    value: T;
  }

  interface Props<T> {
    values: SearchValue<T>[];
    outputValue: T | undefined;
    disabled?: boolean;
  }

  let { values, outputValue = $bindable(), disabled }: Props<T> = $props();

  const fuse = $derived(
    new Fuse(values, {
      keys: ["label"],
      threshold: 0.4,
      ignoreLocation: true,
    }),
  );

  let search = $state("");
  let searchValues = $derived(
    search ? fuse.search(search).map((r) => r.item) : values,
  );
</script>

<div class="join w-full">
  <input
    type="text"
    bind:value={search}
    {disabled}
    class="input w-full join-item"
    placeholder="Search..."
  />
  <button
    class="btn join-item"
    type="button"
    {disabled}
    onclick={() => {
      search = "";
      outputValue = undefined
    }}
  >
    Clear
  </button>
</div>

{#if !disabled}
  <ul
    class="border rounded mt-2 p-2 list-none flex flex-row flex-wrap gap-2 max-h-40 overflow-auto"
  >
    {#if searchValues.length === 0}
      <li class="p-2 italic text-base-content/90">No matches</li>
    {:else}
      {#each searchValues as v (v.value)}
        <li>
          <button
            class="flex items-center p-2 gap-2 cursor-pointer text-left
              {outputValue === v.value
              ? 'bg-primary font-bold'
              : 'hover:bg-base-300'}"
            type="button"
            onclick={() => {
              outputValue = v.value;
            }}
          >
            {#if v.image_url}
              <img
                src={`https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_403/${v.image_url}`}
                class="size-6 object-cover rounded"
                alt=""
                aria-hidden="true"
              />
            {/if}
            <span>{v.label}</span>
          </button>
        </li>
      {/each}
    {/if}
  </ul>
{/if}
