<script>
  const { version_type } = $props();
</script>

{#if version_type === "Base"}
  <span
    class="px-2 py-1 rounded bg-primary text-xs font-semibold"
  >
    <span class="font-clash uppercase">Base</span>
  </span>
{:else if version_type === "Limited"}
  <span
    class="px-2 py-1 rounded bg-accent text-neutral text-xs font-semibold"
  >
    <span class="font-clash uppercase">Limited Edition</span>
  </span>
{:else}
  <span
    class="px-2 py-1 rounded bg-secondary text-xs font-semibold"
  >
    <span class="font-clash uppercase">Trim</span>
  </span>
{/if}
