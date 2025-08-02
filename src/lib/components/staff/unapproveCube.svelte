<script lang="ts">
  import { blur } from "svelte/transition";

  let { cube_id, onCancel }: { cube_id: string, onCancel: () => void } = $props();

  let loading = $state(false);
  let success = $state(false);

  async function unapproveCube() {
    loading = true;

    const res = await fetch("/api/staff/update-cube-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cube_id, status: "Pending" }),
    });
    const data = await res.json();

    if (data.success) {
      success = true;
      loading = false;
      onCancel
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
  <h3 class="font-bold text-lg mb-2">Are you sure?</h3>
  <p class="mb-4">Do you really want to unapprove this cube?</p>
  <div class="flex gap-2">
    <button
      class="btn btn-error flex-1"
      type="button"
      onclick={() => {
        unapproveCube();
        onCancel
      }}
      disabled={loading}
    >
      {#if loading}
        <span class="loading loading-spinner"></span>
        Unapproving...
      {:else if success}
        Unapproved!
      {:else}
        Yes, Unapprove
      {/if}
    </button>
    <button
      class="btn btn-ghost flex-1"
      type="button"
      onclick={onCancel}
    >
      Cancel
    </button>
  </div>
</div>
