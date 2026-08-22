<script>
  const { version_type } = $props();
</script>

{#if version_type === "Base"}
  <span
    class="badge badge-primary text-primary-content text-xs font-semibold"
  >
    <span class="font-clash uppercase">Base</span>
  </span>
{:else if version_type === "Limited"}
  <span
    class="badge badge-accent text-accent-content text-xs font-semibold"
  >
    <span class="font-clash uppercase">Limited Edition</span>
  </span>
{:else}
  <span
    class="badge badge-secondary text-secondary-content text-xs font-semibold"
  >
    <span class="font-clash uppercase">Variant</span>
  </span>
{/if}
