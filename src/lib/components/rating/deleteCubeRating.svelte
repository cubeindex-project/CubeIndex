<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  import { blur } from "svelte/transition";

  let { cube_slug, onCancel }: { cube_slug: string; onCancel: () => void } =
    $props();

  let loading = $state(false);
  let success = $state(false);

  async function deleteRating() {
    loading = true;

    const res = await fetch("/api/rating/delete-rating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cube_slug }),
    });
    const data = await res.json();

    if (data.success) {
      success = true;
      loading = false;
      onCancel();
    } else {
      loading = false;
      new Error("Failed: " + data.error);
    }
  }
</script>

<div
  class="absolute -translate-x-1/2 mt-2 z-50 bg-base-100 p-6 rounded-xl w-80 shadow-xl"
  transition:blur
>
  <h3 class="font-bold text-lg mb-2">
    {m.rating_delete_confirm_title()}
  </h3>
  <p class="mb-4">{m.rating_delete_confirm_description()}</p>
  <div class="flex gap-2">
    <button
      class="btn btn-error flex-1"
      type="button"
      onclick={() => {
        deleteRating();
        onCancel();
      }}
      disabled={loading}
    >
      {#if loading}
        <span class="loading loading-spinner"></span>
        {m.rating_delete_loading_text()}
      {:else if success}
        {m.rating_delete_success_text()}
      {:else}
        {m.rating_delete_confirm_cta()}
      {/if}
    </button>
    <button class="btn btn-ghost flex-1" type="button" onclick={onCancel}>
      {m.rating_delete_cancel_cta()}
    </button>
  </div>
</div>
