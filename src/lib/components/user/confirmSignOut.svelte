<script lang="ts">
  import { onMount } from "svelte";
  import { blur } from "svelte/transition";

  let { onCancel } = $props();

  let dialogEl: HTMLDivElement | null = null;
  let confirmEl: HTMLAnchorElement | null = null;

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    }
  }

  function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  }

  onMount(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusTarget = confirmEl ?? dialogEl;
    focusTarget?.focus();

    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      previouslyFocused?.focus?.();
    };
  });
</script>

<div
  class="fixed inset-0 z-[100] flex items-center justify-center bg-base/60 backdrop-blur-sm px-4"
  role="presentation"
  onclick={handleOverlayClick}
  transition:blur
>
  <div
    class="relative w-full max-w-lg rounded-3xl border border-base-200 bg-base-100 p-8 shadow-2xl"
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-signout-title"
    aria-describedby="confirm-signout-description"
    tabindex="-1"
    bind:this={dialogEl}
  >
    <button
      type="button"
      class="btn btn-circle btn-ghost absolute right-4 top-4"
      aria-label="Close dialog"
      onclick={onCancel}
    >
      <i class="fa-solid fa-xmark text-lg" aria-hidden="true"></i>
    </button>

    <div class="flex flex-col items-center gap-4 text-center">
      <div
        class="flex size-16 items-center justify-center rounded-full bg-warning/20 text-warning"
      >
        <i class="fa-solid fa-right-from-bracket text-2xl" aria-hidden="true"
        ></i>
      </div>

      <div class="space-y-3">
        <h2
          class="text-2xl font-clash font-semibold"
          id="confirm-signout-title"
        >
          Ready to sign out?
        </h2>
        <p class="text-base opacity-80" id="confirm-signout-description">
          You will be logged out of CubeIndex on this device.
        </p>
      </div>

      <div class="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          type="button"
          href="/auth/logout"
          class="btn btn-error btn-lg grow sm:grow-0"
          bind:this={confirmEl}
        >
          <i class="fa-solid fa-check" aria-hidden="true"></i>
          <span>Sign Out</span>
        </a>
        <button
          type="button"
          class="btn btn-ghost btn-lg grow sm:grow-0"
          onclick={onCancel}
        >
          Stay Logged In
        </button>
      </div>
    </div>
  </div>
</div>
