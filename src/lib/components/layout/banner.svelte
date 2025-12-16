<script lang="ts">
  import { onMount } from "svelte";

  const storageKey = "showCubeAwardsBanner";

  let hidden = $state(true);

  const finishDate = Date.UTC(2026, 0, 4);
  const eventFinished = Date.now() >= finishDate;

  onMount(() => {
    try {
      hidden = localStorage.getItem(storageKey) === "true";
    } catch {
      hidden = false;
    }
  });

  function hideBanner() {
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // If localStorage fails, just hide for this session
    }
    hidden = true;
  }
</script>

{#if !hidden && !eventFinished}
  <section class="relative w-full bg-primary text-primary-content">
    <!-- Close button: visible and top-right ONLY on mobile -->
    <button
      type="button"
      onclick={hideBanner}
      aria-label="Hide the CubeIndex Awards banner"
      class="absolute right-4 top-4 btn btn-sm btn-ghost md:hidden"
    >
      <i class="fa-solid fa-x"></i>
    </button>

    <div
      class="mx-auto flex flex-col gap-4 px-4 py-10
           md:flex-row md:items-center md:justify-between md:py-6 md:px-8"
    >
      <h1 class="font-clash text-2xl md:text-3xl font-semibold">
        Celebrating the boldest cubes of the season.
      </h1>

      <div class="flex items-center gap-3 justify-end">
        <a href="/awards" onclick={hideBanner} class="btn btn-accent btn-md w-full md:w-fit">
          Enter the awards
        </a>

        <!-- Close button: appears inline ONLY on md+ -->
        <button
          type="button"
          onclick={hideBanner}
          aria-label="Hide the CubeIndex Awards banner"
          class="btn btn-sm btn-ghost hidden md:inline-flex"
        >
          <i class="fa-solid fa-x"></i>
        </button>
      </div>
    </div>
  </section>
{/if}
