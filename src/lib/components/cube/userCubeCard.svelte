<script lang="ts">
  import CubeVersionType from "./cubeVersionType.svelte";
  import type { Cube, UserCubes } from "../dbTableTypes";
  import { formatDate } from "../helper_functions/formatDate.svelte";

  let {
    mode = "view",
    cube,
    user_details,
    user_rating,
  }: {
    mode?: "view" | "edit";
    cube: Cube;
    user_details: UserCubes;
    user_rating: number;
  } = $props();

  let showNotes = $state(false);

  let isSubmitting = $state(false);
  let showSuccess = $state(false);
  let message = $state("");
  let formMessage = $state("");

  $effect(() => {
    if (showSuccess) location.reload();
  });

  let slug = $state(user_details.cube);
  let quantity = $state(user_details.quantity);
  let condition = $state(user_details.condition);
  let main = $state(user_details.main);
  let status = $state(user_details.status);
  let notes = $state(user_details.notes);
  let acquired_at = $state(user_details.acquired_at);

  async function update() {
    isSubmitting = true;
    formMessage = "";
    const payload = {
      slug,
      quantity,
      main,
      condition,
      status,
      notes,
      acquired_at,
    };

    try {
      const res = await fetch("/api/update-cube-collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess = true;
        location.reload();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      formMessage = err.message;
    } finally {
      isSubmitting = false;
    }
  }

  async function remove() {
    formMessage = "";
    const payload = {
      slug,
    };

    try {
      const res = await fetch("/api/delete-cube-from-collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess = true;
        location.reload();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      formMessage = err.message;
    }
  }
</script>

<div
  class="bg-base-200 border border-base-300 rounded-2xl overflow-hidden transition flex flex-col"
>
  <div class="flex justify-end">
    {#if user_details.quantity > 1}
      <div
        class="absolute bg-primary -mr-3 -mt-3 transform rotate-15 rounded-full size-12 flex items-center justify-center text-primary-content"
      >
        x{user_details.quantity}
      </div>
    {/if}
  </div>
  <img
    src={cube.image_url}
    alt="{cube.series} {cube.model} {cube.version_name}"
    class="w-full h-48 object-cover"
  />
  <div class="p-5 flex-1 flex flex-col">
    <h2 class="text-xl font-bold mb-1 items-center flex gap-2">
      {cube.series}
      {cube.model}
      {#if cube.version_type !== "Base"}
        <span class="text-secondary">{cube.version_name}</span>
      {/if}
      <CubeVersionType version_type={cube.version_type} />
    </h2>
    <p class="text-sm">
      {cube.type} ・ {cube.brand}
    </p>
    {#if mode === "view"}
      <div class="mt-4 flex gap-2">
        <div>
          {#if user_rating > 0}
            <p class="flex flex-row gap-1">
              <span class="font-bold">Rated It:</span>
              <span class="flex items-center">
                {user_rating} <i class="fa-solid fa-star"></i>
              </span>
            </p>
          {/if}
          {#if user_details.condition}
            <p>
              <span class="font-bold">Condition:</span>
              {user_details.condition}
            </p>
          {/if}
          {#if user_details.status}
            <p>
              <span class="font-bold">Status:</span>
              {user_details.status}
            </p>
          {/if}
          {#if user_details.notes}
            <span class="font-bold">Notes:</span>
            <button
              class="cursor-pointer link link-primary"
              onclick={() => {
                showNotes = !showNotes;
              }}>Show</button
            >
            <div
              class="bg-base-300 border border-base-100 p-2 rounded-2xl {showNotes
                ? 'flex'
                : 'hidden'}"
            >
              <p>
                {user_details.notes}
              </p>
            </div>
          {/if}
          {#if user_details.acquired_at}
            <p>
              <span class="font-bold">Acquired At:</span>
              {formatDate(user_details.acquired_at)}
            </p>
          {/if}
        </div>
      </div>
      <a
        href="/explore/cubes/{cube.slug}"
        class="btn btn-primary mt-4"
        aria-label="View Cube Details"
      >
        View Details
        <i class="fa-solid fa-arrow-right"></i>
      </a>
    {:else}
      <div class="mt-4 flex gap-2">
        <div class="w-full">
          <label class="flex flex-col">
            <span class="font-bold">Quantity:</span>
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
          <p>
            <label class="flex flex-col">
              <span class="font-bold">Condition:</span>
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
          </p>
          <p>
            <label class="flex flex-col">
              <span class="font-bold">Status:</span>
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
          </p>
          <label class="flex flex-col">
            <span class="font-bold">Notes:</span>
            <textarea
              name="notes"
              placeholder="Any special notes..."
              bind:value={notes}
              class="textarea textarea-bordered rounded-2xl w-full max-h-50"
            ></textarea>
          </label>
          <p>
            <label class="flex flex-col">
              <span class="font-bold">Acquired Date:</span>
              <input
                name="acquiredAt"
                type="date"
                bind:value={acquired_at}
                class="input input-bordered w-full"
              />
            </label>
          </p>
        </div>
      </div>
      <button
        class="btn btn-primary mt-4 items-center"
        onclick={update}
        disabled={isSubmitting || showSuccess}
      >
        {#if isSubmitting}
          <span class="loading loading-spinner"></span>
          Editing...
        {:else if showSuccess}
          <i class="fa-solid fa-check"></i>
          Edited!
        {:else}
          <i class="fa-solid fa-floppy-disk"></i>
          Save
        {/if}
      </button>

      {#if formMessage}
        <div class="text-error p-2 flex justify-center">{formMessage}</div>
      {/if}
    {/if}
  </div>
</div>
