<script lang="ts">
  const { onClick, addClass }: { onClick: () => void; addClass?: string } =
    $props();
</script>

<button
  class={"btn btn-accent gap-1 " + addClass}
  type="button"
  onclick={onClick}
  aria-label="Rate this Cube"
>
  <i class="fa-solid fa-star mr-2"></i>
  Rate
  <span class="hidden sm:block">this Cube</span>
</button>
