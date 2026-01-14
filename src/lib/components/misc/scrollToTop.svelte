<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  import { onMount } from "svelte";

  /**
   * Floating button that appears after scrolling down and scrolls smoothly to top.
   * @property threshold - Pixels scrolled before showing the button
   */
  let { threshold = 300 } = $props();

  let show = $state(false);

  const updateVisibility = () => {
    const y = typeof window !== "undefined" ? window.scrollY : 0;
    show = y > threshold;
  };

  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (_) {
      // Fallback for older browsers
      window.scrollTo(0, 0);
    }
  };

  onMount(() => {
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  });
</script>

<button
  class="fixed bottom-20 right-6 z-50 btn btn-primary btn-circle shadow-lg transition-opacity duration-200"
  class:opacity-0={!show}
  class:pointer-events-none={!show}
  aria-label={m.misc_scroll_to_top_aria()}
  onclick={scrollToTop}
>
  <i class="fa-solid fa-arrow-up"></i>
  <span class="sr-only">{m.misc_scroll_to_top_label()}</span>
</button>
