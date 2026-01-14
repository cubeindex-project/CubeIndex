<script lang="ts">
  import { m } from "$lib/paraglide/messages";

  const { onClick, addClass }: { onClick: () => void; addClass?: string } =
    $props();
</script>

<button
  class={"btn btn-accent gap-1 " + addClass}
  type="button"
  onclick={onClick}
  aria-label={m.misc_rate_cube_button_aria()}
>
  <i class="fa-solid fa-star mr-2"></i>
  <span class="sm:hidden">{m.misc_rate_cube_button_short_cta()}</span>
  <span class="hidden sm:block">{m.misc_rate_cube_button_full_cta()}</span>
</button>
