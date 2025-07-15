<script lang="ts">
  import { blur } from "svelte/transition";

  let { onCancel, cube } = $props();

  let isSubmitting = $state(false);
  let showSuccess = $state(false);
  let formMessage = $state("");

  let slug = $derived(cube.slug);
  let quantity = $state(1);
  let condition = $state("");
  let main = $state(false);
  let status = $state("");
  let notes = $state("");
  let acquired_at = $state("");

  async function addCubeToCollec() {
    isSubmitting = true;
    formMessage = "";
    const payload = {
      cube: slug,
      quantity,
      main,
      condition,
      status,
      notes,
      acquired_at,
    };

    console.log(payload);

    try {
      const res = await fetch("/api/add-cube-to-collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess = true;
        setTimeout(onCancel(), 1000);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      formMessage = err.message;
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div
  class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
  transition:blur
>
  <form
    class="card max-w-lg transform absolute z-50 backdrop-blur-3xl bg-base-100/80 backdrop-opacity-100 flex items-center mx-1"
    onsubmit={addCubeToCollec}
  >
    <div class="card-body">
      <h2 class="card-title">
        You are adding the {cube.series}
        {cube.model}
        {cube.version_type !== "Base" ? cube.version_name : ""} to your collection.
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Quantity -->
        <label class="flex flex-col">
          <span class="label-text">Quantity</span>
          <input
            name="quantity"
            type="number"
            min="1"
            max="999"
            bind:value={quantity}
            class="input w-full"
            required
          />
        </label>
        <!-- Main cube toggle -->
        <label class="flex items-center space-x-2 mt-6">
          <input
            type="checkbox"
            name="main"
            bind:checked={main}
            class="checkbox bg-base-100"
          />
          <span>Main Cube</span>
        </label>
        <!-- Condition -->
        <label class="flex flex-col">
          <span class="label-text">Condition</span>
          <select
            name="condition"
            bind:value={condition}
            class="select w-full"
            required
          >
            <option value="New in box">New in box</option>
            <option value="New">New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Worn">Worn</option>
            <option value="Poor">Poor</option>
            <option value="Broken">Broken</option>
          </select>
        </label>
        <!-- Status -->
        <label class="flex flex-col">
          <span class="label-text">Status</span>
          <select
            name="status"
            bind:value={status}
            class="select w-full"
            required
          >
            <option value="Owned">Owned</option>
            <option value="Wishlist">Wishlist</option>
            <option value="Loaned">Loaned</option>
            <option value="Borrowed">Borrowed</option>
            <option value="Lost">Lost</option>
          </select>
        </label>
      </div>

      <!-- Full-width fields -->
      <div class="mt-4 space-y-4">
        <label class="flex flex-col">
          <span class="label-text">Notes</span>
          <textarea
            name="notes"
            placeholder="Any special notes..."
            bind:value={notes}
            class="textarea textarea-bordered rounded-2xl w-full max-h-50"
          ></textarea>
        </label>
        <label class="flex flex-col">
          <span class="label-text">Acquired The</span>
          <input
            name="acquiredAt"
            type="date"
            bind:value={acquired_at}
            class="input input-bordered w-full"
          />
        </label>
      </div>
    </div>

    <div class="flex justify-between">
      <div class="card-actions p-4">
        <button
          class="btn btn-secondary"
          onclick={onCancel}
          disabled={isSubmitting}>Cancel</button
        >
      </div>

      <div class="card-actions p-4">
        <button class="btn btn-primary" type="submit" disabled={isSubmitting}>
          {#if isSubmitting}
            <span class="loading loading-spinner"></span>
            Adding...
          {:else if showSuccess}
            <i class="fa-solid fa-check"></i>
            Added!
          {:else}
            Add Cube
          {/if}
        </button>
      </div>
    </div>

    {#if formMessage}
      <div class="text-error p-2 flex justify-center">{formMessage}</div>
    {/if}
  </form>
</div>
