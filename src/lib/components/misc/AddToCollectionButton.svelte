<script lang="ts">
  interface Props {
    onClick: () => void;
    addClass?: string;
  }

  const { onClick, addClass }: Props = $props();
</script>

<button
  class={"btn btn-secondary gap-1 " + addClass}
  type="button"
  onclick={onClick}
  aria-label="Add to Collection"
>
  <i class="fa-solid fa-plus mr-2"></i>
  Add to Collection
</button>
