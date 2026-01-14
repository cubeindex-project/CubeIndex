<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/paraglide/messages";
  import type {
    DetailedCube,
    UserCubeCondition,
    UserCubes,
    UserCubeStatus,
  } from "../dbTableTypes";
  import { formatDate } from "../helper_functions/formatDate.svelte";
  import CubeCardSkeleton from "./cubeCardSkeleton.svelte";
  import { supabase } from "$lib/supabaseClient";
  import { clientLogger } from "$lib/logger/client";
  import { clientLogError } from "$lib/logger/clientLogError";

  /**
   * Combines a user's cube ownership details with minimal vendor info
   * used for display in the card.
   */
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
    cube: DetailedCube;
    user_details: LocalUserCubesType;
    user_rating: number;
  } = $props();

  let isSubmitting = $state(false);
  let showSuccess = $state(false);
  let formMessage = $state("");

  const currencyFormatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
  let purchase_price = $state<number | null>(
    user_details.purchase_price === null ||
      user_details.purchase_price === undefined
      ? null
      : Number(user_details.purchase_price)
  );

  let vendors: { slug: string; name: string }[] = $state([]);

  const statusLabels: Record<UserCubeStatus, string> = {
    Owned: m.cube_status_owned_label(),
    Wishlist: m.cube_status_wishlist_label(),
    Loaned: m.cube_status_loaned_label(),
    Borrowed: m.cube_status_borrowed_label(),
    Lost: m.cube_status_lost_label(),
  };

  const conditionLabels: Record<UserCubeCondition, string> = {
    "New in box": m.cube_condition_new_in_box_label(),
    New: m.cube_condition_new_label(),
    Good: m.cube_condition_good_label(),
    Fair: m.cube_condition_fair_label(),
    Worn: m.cube_condition_worn_label(),
    Poor: m.cube_condition_poor_label(),
    Broken: m.cube_condition_broken_label(),
  };

  async function getVendors() {
    try {
      const { data, error } = await supabase
        .from("vendors")
        .select("slug, name")
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);

      vendors = data;
    } catch (err: any) {
      clientLogError(
        "An error occurred while fetching vendors",
        clientLogger,
        err
      );
    }
  }

  onMount(getVendors);

  async function update() {
    isSubmitting = true;
    formMessage = "";

    if (purchase_price !== null) {
      if (!Number.isFinite(purchase_price) || purchase_price < 0) {
        formMessage = m.cube_user_card_price_invalid_text();
        isSubmitting = false;
        return;
      }
      if (purchase_price > 100000) {
        formMessage = m.cube_user_card_price_too_high_text();
        isSubmitting = false;
        return;
      }
    }

    const payload = {
      cube: slug,
      quantity,
      main,
      condition,
      status,
      bought_from,
      notes,
      acquired_at,
      purchase_price,
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
    {#if user_details.main}
      <div class="absolute left-3 top-3">
        <div class="badge badge-ghost gap-1" title={m.cube_user_card_main_title()}>
          <i class="fa-solid fa-thumbtack"></i>
          {m.cube_user_card_main_label()}
        </div>
      </div>
    {/if}
    {#if user_details.quantity > 1}
      <div class="absolute right-3 top-3">
        <div
          class="badge badge-primary badge-lg gap-1"
          title={m.cube_user_card_quantity_title()}
        >
          <i class="fa-solid fa-layer-group"></i>
          x{user_details.quantity}
        </div>
      </div>
    {/if}
  {:else}
    <div class="absolute right-3 top-3">
      <button
        class="btn btn-error btn-sm"
        onclick={remove}
        aria-label={m.cube_user_card_remove_aria()}
      >
        <i class="fa-solid fa-trash"></i>
        {m.cube_user_card_remove_cta()}
      </button>
    </div>
  {/if}
{/snippet}
{#snippet content()}
  {#if mode === "view"}
    <div class="mt-4">
      <div class="flex flex-wrap gap-2 items-center">
        {#if user_rating > 0}
          <div
            class="badge badge-warning badge-lg gap-1 text-black"
            title={m.cube_user_card_rating_title()}
          >
            <i class="fa-solid fa-star"></i>
            {user_rating}
          </div>
        {/if}

        {#if user_details.status}
          <div
            class="badge badge-lg gap-1 bg-base-300"
            title={m.cube_user_card_status_title()}
          >
            <i class="fa-solid fa-clipboard-check"></i>
            {statusLabels[user_details.status]}
          </div>
        {/if}

        {#if user_details.condition}
          <div
            class="badge badge-lg gap-1 bg-base-300"
            title={m.cube_user_card_condition_title()}
          >
            <i class="fa-solid fa-cube"></i>
            {conditionLabels[user_details.condition]}
          </div>
        {/if}

        {#if user_details.bought_from}
          <div
            class="badge badge-lg gap-1 bg-base-300"
            title={m.cube_user_card_bought_from_title()}
          >
            <i class="fa-solid fa-store"></i>
            {user_details.vendor.name}
          </div>
        {/if}

        {#if user_details.purchase_price !== null}
          <div
            class="badge badge-lg gap-1 bg-base-300"
            title={m.cube_user_card_purchase_price_title()}
          >
            <i class="fa-solid fa-tag"></i>
            {currencyFormatter.format(user_details.purchase_price)}
          </div>
        {/if}

        {#if user_details.acquired_at}
          <div
            class="badge badge-lg gap-1 bg-base-300"
            title={m.cube_user_card_acquired_on_title()}
          >
            <i class="fa-solid fa-calendar-day"></i>
            {formatDate(user_details.acquired_at)}
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
    <form
      class="mt-4 flex gap-2"
      onsubmit={(e) => {
        e.preventDefault();
        update();
      }}
    >
      <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
        <label class="form-control">
          <span class="label-text font-semibold">
            {m.cube_user_card_quantity_label()}
          </span>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            max="999"
            bind:value={quantity}
            class="input input-bordered w-full"
            required
          />
        </label>

        <label class="form-control">
          <span class="label-text font-semibold">
            {m.cube_user_card_status_label()}
          </span>
          <select
            id="status"
            name="status"
            bind:value={status}
            class="select select-bordered w-full"
            required
          >
            <option value="Owned">{m.cube_status_owned_label()}</option>
            <option value="Wishlist">{m.cube_status_wishlist_label()}</option>
            <option value="Loaned">{m.cube_status_loaned_label()}</option>
            <option value="Borrowed">{m.cube_status_borrowed_label()}</option>
            <option value="Lost">{m.cube_status_lost_label()}</option>
          </select>
        </label>

        <label class="form-control">
          <span class="label-text font-semibold">
            {m.cube_user_card_condition_label()}
          </span>
          <select
            id="condition"
            name="condition"
            bind:value={condition}
            class="select select-bordered w-full"
            required
          >
            <option value="New in box">
              {m.cube_condition_new_in_box_label()}
            </option>
            <option value="New">{m.cube_condition_new_label()}</option>
            <option value="Good">{m.cube_condition_good_label()}</option>
            <option value="Fair">{m.cube_condition_fair_label()}</option>
            <option value="Worn">{m.cube_condition_worn_label()}</option>
            <option value="Poor">{m.cube_condition_poor_label()}</option>
            <option value="Broken">{m.cube_condition_broken_label()}</option>
          </select>
        </label>

        <label class="form-control">
          <span class="label-text font-semibold">
            {m.cube_user_card_bought_from_label()}
          </span>
          <select
            id="bought_from"
            name="bought_from"
            bind:value={bought_from}
            class="select select-bordered w-full"
          >
            <option value={null}>{m.cube_user_card_bought_from_none_label()}</option>
            {#each vendors as vendor}
              <option value={vendor.slug}>{vendor.name}</option>
            {/each}
          </select>
        </label>

        <label class="form-control">
          <span class="label-text font-semibold">
            {m.cube_user_card_purchase_price_label()}
          </span>
          <label class="input input-bordered flex items-center gap-2 rounded-xl">
            <span aria-hidden="true">$</span>
            <input
              id="purchase_price"
              name="purchase_price"
              type="number"
              min="0"
              max="100000"
              step="0.01"
              placeholder={m.cube_user_card_purchase_price_placeholder()}
              bind:value={purchase_price}
              class="grow"
              inputmode="decimal"
            />
          </label>
        </label>

        <label class="form-control md:col-span-2">
          <span class="label-text font-semibold">
            {m.cube_user_card_notes_label()}
          </span>
          <textarea
            id="notes"
            name="notes"
            placeholder={m.cube_user_card_notes_placeholder()}
            bind:value={notes}
            class="textarea textarea-bordered rounded-2xl w-full max-h-50"
          ></textarea>
        </label>

        <label class="form-control">
          <span class="label-text font-semibold">
            {m.cube_user_card_acquired_date_label()}
          </span>
          <input
            id="acquiredAt"
            name="acquiredAt"
            type="date"
            bind:value={acquired_at}
            class="input input-bordered w-full"
          />
        </label>

        <label class="label cursor-pointer gap-3 items-center">
          <input
            id="main"
            name="main"
            type="checkbox"
            class="checkbox"
            bind:checked={main}
          />
          <span class="label-text">{m.cube_user_card_main_toggle_label()}</span>
        </label>
      </div>
    </form>
  {/if}
{/snippet}

{#snippet bottom()}
  {#if mode === "view"}
    <a
      href="/explore/cubes/{cube.slug}"
      class="btn btn-primary mt-4"
      aria-label={m.cube_user_card_view_details_aria()}
    >
      {m.cube_user_card_view_details_cta()}
      <i class="fa-solid fa-arrow-right"></i>
    </a>
  {:else}
    <button
      class="btn btn-primary mt-4 items-center"
      onclick={update}
      disabled={isSubmitting || showSuccess}
      aria-live="polite"
    >
      {#if isSubmitting}
        <span class="loading loading-spinner"></span>
        {m.cube_user_card_save_loading_text()}
      {:else if showSuccess}
        <i class="fa-solid fa-check"></i>
        {m.cube_user_card_save_success_text()}
      {:else}
        <i class="fa-solid fa-floppy-disk"></i>
        {m.cube_user_card_save_cta()}
      {/if}
    </button>

    {#if formMessage}
      <div class="alert alert-error mt-3">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>{formMessage}</span>
      </div>
    {/if}
  {/if}
{/snippet}

<CubeCardSkeleton
  {cube}
  rating={false}
  {top}
  {content}
  {bottom}
/>
