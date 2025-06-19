<script>
  const { version_type, moreInfo } = $props();
</script>

{#if version_type === "Base"}
    <span
        class="ml-2 px-2 py-1 rounded bg-blue-700/80 text-xs font-semibold relative group"
    >
        <span class="font-clash uppercase">Base</span>
        {#if moreInfo}
            <span
                class="absolute right-0 top-full mt-2 w-max max-w-xs bg-neutral-800 text-white text-xs rounded p-2 shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity z-20"
            >
                The base version is the original or standard version of this
                cube model.
            </span>
        {/if}
    </span>
{:else if version_type === "Limited"}
    <span
        class="ml-2 px-2 py-1 rounded bg-yellow-500/80 text-xs font-semibold relative group"
    >
        <span class="font-clash uppercase">Limited Edition</span>
        {#if moreInfo}
            <span
                class="absolute -right-0 top-full mt-2 w-max max-w-xs bg-neutral-800 text-white text-xs rounded p-2 shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity z-20"
            >
                Limited Edition versions are produced in restricted quantities
                and may feature unique colors, packaging, or other special
                characteristics.
            </span>
        {/if}
    </span>
{:else}
  <span
    class="ml-2 px-2 py-1 rounded bg-green-600/80 text-xs font-semibold relative group"
  >
    <span class="font-clash uppercase">Trim</span>
    {#if moreInfo}
      <span
        class="absolute -right-0 top-full mt-2 w-max max-w-xs bg-neutral-800 text-white text-xs rounded p-2 shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity z-20"
      >
        Trim versions are alternate variants of the base model, often with
        different colors, finishes, or minor features.
      </span>
    {/if}
  </span>
{/if}
