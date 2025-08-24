<script lang="ts">
  import { onMount } from "svelte";
  import type { Cube, UserCubes } from "../dbTableTypes";
  import { formatDate } from "../helper_functions/formatDate.svelte";
  import CubeCardSkeleton from "./cubeCardSkeleton.svelte";
  import { supabase } from "$lib/supabaseClient";

  interface LocalUserCubesType extends UserCubes {
    vendor: { name: string };
  }

  let {
    mode = "view",
    cube,
    user_details,
    user_rating,
  }: {
    mode?: "view" | "edit";
    cube: Cube;
    user_details: LocalUserCubesType;
    user_rating: number;
  } = $props();

  let isSubmitting = $state(false);
  let showSuccess = $state(false);
  let formMessage = $state("");

  $effect(() => {
    if (showSuccess) location.reload();
  });

  let slug = $state(user_details.cube);
  let quantity = $state(user_details.quantity);
  let condition = $state(user_details.condition);
  let main = $state(user_details.main);
  let status = $state(user_details.status);
  let bought_from = $state(user_details.bought_from);
  let notes = $state(user_details.notes);
  let acquired_at = $state(user_details.acquired_at);

  let vendors: { slug: string; name: string }[] = $state([]);

  async function getVendors() {
    try {
      const { data, error } = await supabase
        .from("vendors")
        .select("slug, name")
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);

      vendors = data;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  onMount(getVendors);

  async function update() {
    isSubmitting = true;
    formMessage = "";
    const payload = {
      cube: slug,
      quantity,
      main,
      condition,
      status,
      bought_from,
      notes,
      acquired_at,
    };

    try {
      const res = await fetch("/api/add-cube-to-collection", {
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

{#snippet top()}
  {#if mode === "view"}
    <div class="flex justify-end">
      {#if user_details.quantity > 1}
        <div
          class="absolute bg-primary -mr-3 -mt-3 transform rotate-15 rounded-full size-12 flex items-center justify-center text-primary-content"
        >
          x{user_details.quantity}
        </div>
      {/if}
    </div>
  {:else}
    <div class="flex justify-end">
      <button
        class="absolute bg-error rounded-bl-2xl flex items-center justify-center text-error-content p-2 gap-2 cursor-pointer"
        onclick={remove}
      >
        <i class="fa-solid fa-trash"></i>
        Remove
      </button>
    </div>
  {/if}
{/snippet}
{#snippet content()}
  {#if mode === "view"}
    <div class="mt-4">
      <div class="flex flex-wrap gap-3 items-center">
        {#if user_rating > 0}
          <div class="badge badge-lg gap-1 bg-warning text-black">
            <i class="fa-solid fa-star"></i>
            Rated {user_rating}
          </div>
        {/if}

        {#if user_details.condition}
          <div class="badge badge-lg gap-1 bg-base-300">
            <i class="fa-solid fa-cube"></i>
            Condition: {user_details.condition}
          </div>
        {/if}

        {#if user_details.bought_from}
          <div class="badge badge-lg gap-1 bg-base-300">
            <i class="fa-solid fa-clipboard-check"></i>
            Bought From: {user_details.vendor.name}
          </div>
        {/if}

        {#if user_details.status}
          <div class="badge badge-lg gap-1 bg-base-300">
            <i class="fa-solid fa-clipboard-check"></i>
            Status: {user_details.status}
          </div>
        {/if}

        {#if user_details.acquired_at}
          <div class="badge badge-lg gap-1 bg-base-300">
            <i class="fa-solid fa-calendar-day"></i>
            Acquired: {formatDate(user_details.acquired_at)}
          </div>
        {/if}
      </div>

      {#if user_details.notes}
        <div class="mt-3 bg-base-200 border border-base-100 p-3 rounded-xl">
          <p class="whitespace-pre-wrap">{user_details.notes}</p>
        </div>
      {/if}
    </div>
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
        <label class="form-control">
          <span class="font-bold">Bought From:</span>
          <select
            name="bought_from"
            bind:value={bought_from}
            class="select select-bordered w-full"
          >
            <option value={null}>None</option>
            {#each vendors as vendor}
              <option value={vendor.slug}>{vendor.name}</option>
            {/each}
          </select>
        </label>
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
  {/if}
{/snippet}

{#snippet bottom()}
  {#if mode === "view"}
    <a
      href="/explore/cubes/{cube.slug}"
      class="btn btn-primary mt-4"
      aria-label="View Cube Details"
    >
      View Details
      <i class="fa-solid fa-arrow-right"></i>
    </a>
  {:else}
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
{/snippet}

<CubeCardSkeleton
  {cube}
  newRibbon={false}
  rating={false}
  {top}
  {content}
  {bottom}
/>
