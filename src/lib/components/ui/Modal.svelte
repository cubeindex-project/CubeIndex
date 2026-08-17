<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    open: boolean;
    children: Snippet;
    title: string;
    description?: string;
  }

  let { open = $bindable(), children, title, description }: Props = $props();

  let dialogEl: HTMLDialogElement;

  $effect(() => {
    if (!dialogEl || open === dialogEl.open) return;

    if (open) {
      dialogEl.showModal();
    } else {
      dialogEl.close();
    }
  });
</script>

<dialog
  class="modal modal-bottom sm:modal-middle"
  bind:this={dialogEl}
  onclose={() => {
    open = false;
  }}
>
  <div class="modal-box flex flex-col gap-6">
    <div class="flex flex-col">
      <h2>
        {title}
      </h2>
      {#if description}
        <p class="text-sm opacity-80">
          {description}
        </p>
      {/if}
    </div>
    {@render children()}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
