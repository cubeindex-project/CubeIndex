<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade } from "svelte/transition";

  interface Props {
    onCancel: () => void;
    children: Snippet;
    title: string;
    description?: string;
  }

  let { onCancel, children, title, description }: Props = $props();

  let dialogEl: HTMLDialogElement;

  $effect(() => {
    if (dialogEl) {
      dialogEl.showModal();
    }
  });
</script>

<dialog
  class="card fixed w-full max-w-xl m-auto shadow-2xl rounded-3xl ring-1 ring-base-300/60 bg-base-100/90 backdrop-blur backdrop:bg-black/60 backdrop:backdrop-blur-sm"
  bind:this={dialogEl}
  onclose={onCancel}
  transition:fade={{ duration: 120 }}
>
  <div class="card-body gap-6">
    <!-- Header -->
    <div class="flex">
      <div class="flex-1">
        <h2 class="card-title">
          {title}
        </h2>
        {#if description}
          <p class="text-sm opacity-80">
            {description}
          </p>
        {/if}
      </div>
      <div class="card-actions">
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          onclick={onCancel}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
    {@render children()}
  </div>
</dialog>

<style>
  /* Animates the dark backdrop overlay */
  dialog[open]::backdrop {
    transition: opacity 0.2s ease-out;

    @starting-style {
      opacity: 0;
    }
  }
</style>
