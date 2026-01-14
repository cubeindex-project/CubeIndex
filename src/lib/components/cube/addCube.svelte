<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  import { getContext, onMount } from "svelte";
  import { fade, scale } from "svelte/transition";
  import NumberFlow, { continuous } from "@number-flow/svelte";
  import { supabase } from "$lib/supabaseClient";
  import { clientLogError } from "$lib/logger/clientLogError";
  import { clientLogger } from "$lib/logger/client";
  import type { UserCubeCondition, UserCubeStatus } from "../dbTableTypes";

  let {
    onCancel,
    cube,
    alreadyAdded,
    defaultData = {
      quantity: 1,
      condition: "" as UserCubeCondition | "",
      main: false,
      status: "" as UserCubeStatus | "",
      bought_from: null,
      notes: "",
      acquired_at: "",
      purchase_price: null as number | null,
    },
  } = $props();

  const userCtx = getContext<any>("user");
  let isConnected = $derived(Boolean(userCtx?.id ?? userCtx)); // robust truthiness

  // UI state
  let isSubmitting = $state(false);
  let showSuccess = $state(false);
  let formMessage = $state<string>("");

  // form state
  let slug = $derived(cube.slug);
  let quantity = $state(defaultData.quantity ?? 1);
  let condition = $state<UserCubeCondition | "">(defaultData.condition || "");
  let main = $state(defaultData.main);
  let status = $state<UserCubeStatus | "">(defaultData.status || "");
  let bought_from = $state(defaultData.bought_from || null);
  let notes = $state(defaultData.notes);
  let acquired_at = $state(defaultData.acquired_at);
  let purchase_price = $state<number | null>(
    defaultData.purchase_price === null ||
      defaultData.purchase_price === undefined
      ? null
      : Number(defaultData.purchase_price),
  );

  // sensible defaults
  $effect(() => {
    if (!status) status = "Owned";
    if (!condition) condition = "New";
  });

  // wishlist rule
  $effect(() => {
    if (status === "Wishlist") quantity = 1;
  });

  // simple client checks
  function validate(): string | null {
    if (!status) return m.cube_add_validation_status_required_text();
    if (!condition) return m.cube_add_validation_condition_required_text();
    if (!quantity || quantity < 1 || quantity > 999)
      return m.cube_add_validation_quantity_range_text({ min: 1, max: 999 });
    if (purchase_price !== null) {
      if (!Number.isFinite(purchase_price) || purchase_price < 0)
        return m.cube_add_validation_price_invalid_text();
      if (purchase_price > 100000)
        return m.cube_add_validation_price_too_high_text();
    }
    if (acquired_at) {
      const today = new Date().toISOString().slice(0, 10);
      if (acquired_at > today)
        return m.cube_add_validation_acquired_future_text();
    }
    return null;
  }

  // focus handling + trap
  let dialogEl: HTMLFormElement | null = null;

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel?.();
    }
    if (e.key === "Tab" && dialogEl) {
      const focusables = dialogEl.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      const list = Array.from(focusables).filter(
        (el) => !el.hasAttribute("inert"),
      );
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  let vendors: { slug: string; name: string }[] = $state([]);

  async function getVendors() {
    try {
      const { data, error } = await supabase
        .from("vendors")
        .select("slug, name")
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);

      vendors = data;
    } catch (err) {
      clientLogError(
        "An error occurred while fetching vendors",
        clientLogger,
        err,
      );
    }
  }

  onMount(getVendors);

  async function addCubeToCollec(e: SubmitEvent) {
    e.preventDefault(); // ensure no page nav
    formMessage = "";

    const err = validate();
    if (err) {
      formMessage = err;
      return;
    }
    if (!isConnected) {
      formMessage = m.cube_add_auth_required_text();
      return;
    }

    isSubmitting = true;

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

      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) {
        showSuccess = true;
        // FIX: don't call onCancel immediately
        setTimeout(onCancel, 900);
      } else {
        throw new Error(
          data?.error || m.cube_add_submit_failed_text(),
        );
      }
    } catch (err: any) {
      formMessage = err?.message ?? m.cube_add_unexpected_error_text();
    } finally {
      isSubmitting = false;
    }
  }

  let readonly: boolean = $derived(status === "Wishlist");

  // assume `quantity` and `readonly` exist in scope
  const MIN = 1;
  const MAX = 999;

  const canDec = $derived(!readonly && quantity > MIN);
  const canInc = $derived(!readonly && quantity < MAX);

  function dec() {
    if (!canDec) return;
    quantity = Math.max(MIN, quantity - 1);
  }
  function inc() {
    if (!canInc) return;
    quantity = Math.min(MAX, quantity + 1);
  }
</script>

<!-- Backdrop -->
<div
  class="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm"
  role="none"
  transition:fade={{ duration: 120 }}
  onkeydown={onKeydown}
>
  <!-- Dialog -->
  <form
    aria-labelledby="add-cube-title"
    aria-describedby="add-cube-desc"
    class="card w-full max-w-xl mx-3 shadow-2xl rounded-3xl ring-1 ring-base-300/60 bg-base-100/90 backdrop-blur supports-[backdrop-filter]:bg-base-100/80"
    onsubmit={addCubeToCollec}
    transition:scale={{ duration: 150, start: 0.95 }}
    bind:this={dialogEl}
  >
    <div class="card-body gap-6">
      <!-- Header -->
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <h2 id="add-cube-title" class="card-title leading-tight">
            {alreadyAdded
              ? m.cube_add_edit_title()
              : m.cube_add_add_title()}
          </h2>
          <p id="add-cube-desc" class="text-sm opacity-80">
            {cube.series}
            {cube.model}
            {cube.version_type !== "Base" ? ` · ${cube.version_name}` : ""}
          </p>
        </div>
        <button
          type="button"
          class="btn btn-ghost btn-sm rounded-xl"
          onclick={onCancel}
          aria-label={m.cube_add_close_aria()}
        >
          ✕
        </button>
      </div>

      <!-- Form grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <!-- Quantity -->
        <label class="form-control">
          <div class="label">
            <span class="label-text">{m.cube_add_quantity_label()}</span>
            {#if status === "Wishlist"}
              <span class="label-text-alt opacity-70">
                {m.cube_add_quantity_locked_text()}
              </span>
            {/if}
          </div>
          <div class="flex w-full items-center gap-2">
            <button
              class="btn btn-square no-animation"
              type="button"
              disabled={!canDec}
              aria-disabled={!canDec}
              aria-label={m.cube_add_quantity_decrease_aria()}
              onclick={dec}
              onmousedown={(e) => e.preventDefault()}
            >
              <i class="fa-solid fa-minus"></i>
            </button>

            <NumberFlow
              value={quantity}
              plugins={[continuous]}
              aria-live="polite"
            />

            <button
              class="btn btn-square no-animation"
              type="button"
              disabled={!canInc}
              aria-disabled={!canInc}
              aria-label={m.cube_add_quantity_increase_aria()}
              onclick={inc}
              onmousedown={(e) => e.preventDefault()}
            >
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </label>

        <!-- Main cube -->
        <label class="form-control">
          <div class="label">
            <span class="label-text">{m.cube_add_main_label()}</span>
            <span class="label-text-alt opacity-70">
              {m.cube_add_main_helper_text()}
            </span>
          </div>
          <div class="join">
            <input
              type="checkbox"
              name="main"
              bind:checked={main}
              class="toggle join-item bg-base-100"
              aria-label={m.cube_add_main_toggle_aria()}
            />
          </div>
        </label>

        <!-- Condition -->
        <label class="form-control md:col-span-1">
          <div class="label">
            <span class="label-text">{m.cube_add_condition_label()}</span>
          </div>
          <select
            name="condition"
            bind:value={condition}
            class="select select-bordered rounded-xl w-full"
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

        <!-- Status -->
        <label class="form-control md:col-span-1">
          <div class="label">
            <span class="label-text">{m.cube_add_status_label()}</span>
          </div>
          <select
            name="status"
            bind:value={status}
            class="select select-bordered rounded-xl w-full"
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
          <div class="label">
            <span class="label-text">{m.cube_add_bought_from_label()}</span>
          </div>
          <select
            name="bought_from"
            bind:value={bought_from}
            class="select select-bordered rounded-xl w-full"
          >
            <option value={null}>{m.cube_add_bought_from_none_label()}</option>
            {#each vendors as vendor (vendor.slug)}
              <option value={vendor.slug}>{vendor.name}</option>
            {/each}
          </select>
        </label>

        <label class="form-control">
          <div class="label">
            <span class="label-text">{m.cube_add_purchase_price_label()}</span>
            <span class="label-text-alt opacity-70">
              {m.cube_add_optional_label()}
            </span>
          </div>
          <label class="input flex items-center gap-2 rounded-xl">
            <span aria-hidden="true">$</span>
            <input
              type="number"
              name="purchase_price"
              bind:value={purchase_price}
              class="grow"
              min="0"
              max="100000"
              step="0.01"
              placeholder={m.cube_add_purchase_price_placeholder()}
              inputmode="decimal"
            />
          </label>
        </label>

        <!-- Notes (full width on md) -->
        <label class="form-control md:col-span-2">
          <div class="label">
            <span class="label-text">{m.cube_add_notes_label()}</span>
            <span class="label-text-alt opacity-70">
              {m.cube_add_optional_label()}
            </span>
          </div>
          <textarea
            name="notes"
            placeholder={m.cube_add_notes_placeholder()}
            bind:value={notes}
            class="textarea textarea-bordered rounded-2xl w-full min-h-24"
            maxlength="2000"
          ></textarea>
        </label>

        <!-- Acquired date -->
        <label class="form-control md:col-span-1">
          <div class="label">
            <span class="label-text">{m.cube_add_acquired_on_label()}</span>
            <span class="label-text-alt opacity-70">
              {m.cube_add_optional_label()}
            </span>
          </div>
          <input
            name="acquiredAt"
            type="date"
            bind:value={acquired_at}
            class="input input-bordered rounded-xl w-full"
            max={new Date().toISOString().slice(0, 10)}
          />
        </label>
      </div>

      <!-- Footer -->
      <div class="flex flex-col md:flex-row gap-3 justify-between items-center">
        <div
          class="text-sm min-h-5 text-error"
          aria-live="polite"
          aria-atomic="true"
        >
          {formMessage}
          {#if !isConnected}
            {m.cube_add_auth_required_text()}
          {/if}
        </div>

        <div class="flex gap-2">
          <button
            class="btn btn-ghost rounded-xl"
            type="button"
            onclick={onCancel}
            disabled={isSubmitting}
          >
            {m.cube_add_cancel_cta()}
          </button>
          <button
            class="btn btn-primary rounded-xl"
            type="submit"
            disabled={isSubmitting || !isConnected}
          >
            {#if isSubmitting}
              <span class="loading loading-spinner"></span>
              <span class="ml-2">
                {alreadyAdded
                  ? m.cube_add_editing_text()
                  : m.cube_add_adding_text()}
              </span>
            {:else if showSuccess}
              <i class="fa-solid fa-check mr-2" aria-hidden="true"></i>
              {alreadyAdded
                ? m.cube_add_edited_text()
                : m.cube_add_added_text()}
            {:else}
              {alreadyAdded ? m.cube_add_edit_cta() : m.cube_add_add_cta()}
            {/if}
          </button>
        </div>
      </div>
    </div>
  </form>
</div>
