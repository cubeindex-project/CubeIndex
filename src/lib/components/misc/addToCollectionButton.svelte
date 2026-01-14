<script lang="ts">
  import { m } from "$lib/paraglide/messages";

  const {
    onClick,
    alreadyAdded,
    addClass,
  }: { onClick: () => void; alreadyAdded: boolean; addClass?: string } =
    $props();
</script>

<button
  class={"btn btn-secondary gap-1 " + addClass}
  type="button"
  onclick={onClick}
  aria-label={alreadyAdded
    ? m.misc_add_to_collection_edit_aria()
    : m.misc_add_to_collection_add_aria()}
>
  {#if alreadyAdded}
    <i class="fa-solid fa-pencil mr-2"></i>
    {m.misc_add_to_collection_edit_cta()}
  {:else}
    <i class="fa-solid fa-plus mr-2"></i>
    <span class="sm:hidden">{m.misc_add_to_collection_short_cta()}</span>
    <span class="hidden sm:block">{m.misc_add_to_collection_full_cta()}</span>
  {/if}
</button>
