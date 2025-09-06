<script lang="ts">
  import { onMount } from "svelte";
  import { goto, afterNavigate } from "$app/navigation";

  /**
   * Floating button that navigates to the previous page.
   * Mobile-only; appears after a moment of inactivity.
   * @property fallback - Path to navigate when history is not available
   * @property idleDelay - Milliseconds before showing after inactivity
   */
  let { fallback = "/", idleDelay = 800 }: { fallback?: string; idleDelay?: number } = $props();

  let canGoBack = $state(false);
  let isIdle = $state(false);
  let inactivityTimer: number | null = null;

  const update = () => {
    try {
      canGoBack = typeof history !== "undefined" && history.length > 1;
    } catch (_) {
      canGoBack = false;
    }
  };

  const scheduleIdle = () => {
    if (inactivityTimer) window.clearTimeout(inactivityTimer);
    inactivityTimer = window.setTimeout(() => {
      isIdle = true;
    }, idleDelay);
  };

  const onActivity = () => {
    isIdle = false;
    scheduleIdle();
  };

  const goBack = () => {
    if (canGoBack) {
      history.back();
    } else {
      void goto(fallback);
    }
  };

  onMount(() => {
    update();
    scheduleIdle();
    const onPop = () => update();
    window.addEventListener("popstate", onPop);

    const passive = { passive: true } as const;
    window.addEventListener("scroll", onActivity, passive);
    window.addEventListener("keydown", onActivity);

    const unsubscribe = afterNavigate(() => {
      update();
      onActivity();
    });
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("scroll", onActivity);
      window.removeEventListener("keydown", onActivity);
      if (inactivityTimer) window.clearTimeout(inactivityTimer);
      unsubscribe;
    };
  });
</script>

<button
  class="fixed bottom-6 left-6 z-50 btn btn-secondary btn-circle shadow-md transition-opacity duration-200 md:hidden"
  class:opacity-0={!canGoBack || !isIdle}
  class:pointer-events-none={!canGoBack || !isIdle}
  aria-label="Go back"
  onclick={goBack}
>
  <i class="fa-solid fa-arrow-left"></i>
  <span class="sr-only">Back</span>
</button>
