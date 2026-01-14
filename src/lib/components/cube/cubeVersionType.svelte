<script>
  import { m } from "$lib/paraglide/messages";

  const { version_type } = $props();
</script>

{#if version_type === "Base"}
  <span
    class="px-2 py-1 rounded bg-primary text-primary-content text-xs font-semibold"
  >
    <span class="font-clash uppercase">{m.cube_version_base_label()}</span>
  </span>
{:else if version_type === "Limited"}
  <span
    class="px-2 py-1 rounded bg-accent text-accent-content text-xs font-semibold"
  >
    <span class="font-clash uppercase">
      {m.cube_version_limited_label()}
    </span>
  </span>
{:else}
  <span
    class="px-2 py-1 rounded bg-secondary text-secondary-content text-xs font-semibold"
  >
    <span class="font-clash uppercase">{m.cube_version_trim_label()}</span>
  </span>
{/if}
