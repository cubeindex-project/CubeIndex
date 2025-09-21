<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  const storageKey = "cubeindex-beta-banner-dismissed";

  let isOpen = $state(false);

  onMount(() => {
    if (!browser) {
      return;
    }

    try {
      if (localStorage.getItem(storageKey) === "1") {
        isOpen = false;
      }
    } catch (error) {
      console.error("Failed to read beta banner preference", error);
    }
  });

  function dismiss({ persist = true }: { persist?: boolean } = {}) {
    isOpen = false;

    if (!browser || !persist) {
      return;
    }

    try {
      localStorage.setItem(storageKey, "1");
    } catch (error) {
      console.error("Failed to persist beta banner preference", error);
    }
  }
</script>

{#if isOpen}
  <div class="flex w-full justify-center px-4">
    <div
      class="relative mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-2xl border border-primary/40 bg-base-100/95 p-4 shadow-md backdrop-blur-sm sm:flex-row sm:items-center sm:gap-4"
    >
      <div class="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start">
        <span
          class="flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-primary"
        >
          <i class="fa-solid fa-flask text-lg"></i>
        </span>

        <div class="space-y-2 text-sm text-base-content/80 sm:text-base">
          <p class="font-semibold text-base-content sm:text-lg">
            Ready to help shape CubeIndex?
          </p>
          <p>
            Opt into the beta to preview new features, share feedback early, and influence what ships
            next.
          </p>

          <div class="flex flex-wrap gap-2">
            <a
              href="/user/settings?tab=beta"
              class="btn btn-primary btn-xs sm:btn-sm rounded-xl"
              onclick={() => dismiss({ persist: false })}
            >
              <i class="fa-solid fa-sliders text-xs"></i>
              <span>Manage beta settings</span>
            </a>
            <a
              href="/beta"
              class="btn btn-ghost btn-xs sm:btn-sm rounded-xl border border-base-300 hover:border-primary"
              onclick={() => dismiss({ persist: false })}
            >
              <i class="fa-solid fa-circle-question text-xs"></i>
              <span>Learn about the beta</span>
            </a>
          </div>
        </div>
      </div>

      <button
        class="absolute right-3 top-3 text-base text-base-content/60 transition hover:text-base-content"
        aria-label="Close"
        onclick={() => dismiss({ persist: true })}
      >
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  </div>
{/if}
