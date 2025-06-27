<script>
  import { m } from "$lib/paraglide/messages";
  const { cube, moreInfo } = $props();
</script>

{#if cube.version_type === "Base"}
  <span
    class="ml-2 px-2 py-1 rounded bg-blue-700/80 text-xs font-semibold relative group"
  >
    <span class="font-clash uppercase">{m.base()}</span>
    {#if moreInfo}
      <span
        class="absolute right-0 top-full mt-2 w-max max-w-xs bg-neutral-800 text-white text-xs rounded p-2 shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity z-20"
      >
        {m.base_version()}
      </span>
    {/if}
  </span>
{:else if cube.version_type === "Limited"}
  <span
    class="ml-2 px-2 py-1 rounded bg-yellow-500/80 text-xs font-semibold relative group"
  >
    <span class="font-clash uppercase">{m.limited_edition()}</span>
    {#if moreInfo}
      <span
        class="absolute -right-0 top-full mt-2 w-max max-w-xs bg-neutral-800 text-white text-xs rounded p-2 shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity z-20"
      >
        {m.limited_version()}
      </span>
    {/if}
  </span>
{:else}
  <span
    class="ml-2 px-2 py-1 rounded bg-green-600/80 text-xs font-semibold relative group"
  >
    <span class="font-clash uppercase">{m.trim()}</span>
    {#if moreInfo}
      <span
        class="absolute -right-0 top-full mt-2 w-max max-w-xs bg-neutral-800 text-white text-xs rounded p-2 shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity z-20"
      >
        {m.trim_version()}
      </span>
    {/if}
  </span>
{/if}
