<script lang="ts">
  const {
    onClick,
    alreadyAdded,
  }: { onClick: () => void; alreadyAdded: boolean } = $props();
</script>

<button
  class="btn btn-secondary"
  type="button"
  onclick={onClick}
  aria-label="Add to Collection"
>
  {#if alreadyAdded}
    <i class="fa-solid fa-pencil mr-2"></i>
    Edit
  {:else}
    <i class="fa-solid fa-plus mr-2"></i>
    Add to Collection
  {/if}
</button>
