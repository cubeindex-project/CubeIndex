<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  import { fade, scale } from "svelte/transition";

  const { children, onCancel, title } = $props();
</script>

<div
  class="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm"
  role="none"
  transition:fade={{ duration: 120 }}
>
  <div
    class="card w-fit max-w-full mx-3 shadow-2xl rounded-3xl ring-1 ring-base-300/60 bg-base-100/90 backdrop-blur supports-[backdrop-filter]:bg-base-100/80"
    transition:scale={{ duration: 150, start: 0.95 }}
  >
    <div class="card-body">
      <div class="flex items-center justify-between gap-3">
        {#if title}
          <h3 class="text-lg font-semibold leading-tight">{title}</h3>
        {/if}
        <button
          type="button"
          class="btn btn-ghost btn-sm rounded-xl"
          onclick={onCancel}
          aria-label={m.layout_card_close_aria()}
        >
          ✕
        </button>
      </div>
      {@render children()}
    </div>
  </div>
</div>
