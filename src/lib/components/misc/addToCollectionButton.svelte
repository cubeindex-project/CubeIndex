<script lang="ts">
  interface Props {
    onClick: () => void;
    alreadyAdded: boolean;
    addClass?: string;
  }

  const { onClick, alreadyAdded, addClass }: Props = $props();
</script>

<button
  class={"btn btn-secondary gap-1 " + addClass}
  type="button"
  onclick={onClick}
  aria-label="Add to Collection"
>
  {#if alreadyAdded}
    <i class="fa-solid fa-pencil mr-2"></i>
    Edit
  {:else}
    <i class="fa-solid fa-plus mr-2"></i>
    Add
    <span class="hidden sm:block">to Collection</span>
  {/if}
</button>
