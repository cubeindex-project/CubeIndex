<script lang="ts">
  import { onMount } from "svelte";
  import NumberFlow, { continuous } from "@number-flow/svelte";
  import { clientLogError } from "$lib/logger/clientLogError";
  import { clientLogger } from "$lib/logger/client";
  import type { Tables } from "$lib/types/database.types";
  import { page } from "$app/state";
  import Modal from "../layout/modal.svelte";

  interface Props {
    onCancel: () => void;
    cube: Pick<Tables<"v_detailed_cube_models">, "slug" | "name">;
    alreadyAdded: boolean;
    defaultData?: Pick<
      Tables<"user_cubes">,
      | "quantity"
      | "condition"
      | "main"
      | "status"
      | "bought_from"
      | "notes"
      | "acquired_at"
      | "purchase_price"
    >;
  }

  const MIN_QUANTITY = 1;
  const MAX_QUANTITY = 999;
  const DEFAULT_DATA = {
    quantity: 1,
    condition: "New in box",
    main: false,
    status: "Owned",
    bought_from: null,
    notes: "",
    acquired_at: "",
    purchase_price: null,
  } satisfies Props["defaultData"];

  let {
    onCancel,
    cube,
    alreadyAdded,
    defaultData = DEFAULT_DATA,
  }: Props = $props();

  const supabase = page.data.supabase;
  const user = $derived(page.data.user);

  let isConnected = $derived(Boolean(user));

  // UI state
  let isSubmitting = $state(false);
  let showSuccess = $state(false);
  let formMessage = $state<string>("");

  let slug = $derived(cube.slug);

  // svelte-ignore state_referenced_locally
  let form = $state({
    quantity: defaultData.quantity,
    condition: defaultData.condition,
    main: defaultData.main,
    status: defaultData.status,
    bought_from: defaultData.bought_from,
    notes: defaultData.notes,
    acquired_at: defaultData.acquired_at,
    purchase_price:
      defaultData.purchase_price === null
        ? null
        : Number(defaultData.purchase_price),
  });

  // wishlist rule
  $effect(() => {
    if (form.status === "Wishlist") form.quantity = 1;
  });

  // simple client checks
  function validate(): string | null {
    if (!form.status) return "Please choose a status.";
    if (!form.condition) return "Please choose a condition.";
    if (!form.quantity || form.quantity < 1 || form.quantity > 999)
      return "Quantity must be between 1 and 999.";
    if (form.purchase_price !== null) {
      if (!Number.isFinite(form.purchase_price) || form.purchase_price < 0)
        return "Price must be a valid number greater than or equal to 0.";
      if (form.purchase_price > 100000)
        return "Price seems too high. Please double-check.";
    }
    if (form.acquired_at) {
      const today = new Date().toISOString().slice(0, 10);
      if (form.acquired_at > today)
        return "Acquired date cannot be in the future.";
    }
    return null;
  }

  let vendors: { slug: string; name: string }[] = $state([]);

  async function loadVendors() {
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

  onMount(loadVendors);

  async function addCubeToCollection(e: SubmitEvent) {
    e.preventDefault(); // ensure no page nav
    formMessage = "";

    const err = validate();
    if (err) {
      formMessage = err;
      return;
    }
    if (!isConnected) {
      formMessage = "You must be logged in to perform this action.";
      return;
    }

    isSubmitting = true;

    const payload = {
      cube: slug,
      quantity: form.quantity,
      main: form.main,
      condition: form.condition,
      status: form.status,
      bought_from: form.bought_from,
      notes: form.notes,
      acquired_at: form.acquired_at,
      purchase_price: form.purchase_price,
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
          data?.error || "Unable to add the cube. Please try again.",
        );
      }
    } catch (err) {
      formMessage =
        err instanceof Error
          ? err.message
          : "Unexpected error. Please try again.";
    } finally {
      isSubmitting = false;
    }
  }

  let readonly: boolean = $derived(form.status === "Wishlist");

  const canDec = $derived(!readonly && form.quantity > MIN_QUANTITY);
  const canInc = $derived(!readonly && form.quantity < MAX_QUANTITY);
</script>

<Modal
  title={alreadyAdded ? "Edit Cube" : "Add to Collection"}
  description={cube.name ?? undefined}
  {onCancel}
>
  <form
    aria-labelledby="add-cube-title"
    aria-describedby="add-cube-desc"
    onsubmit={addCubeToCollection}
    method="dialog"
  >
    <!-- Form grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      <!-- Quantity -->
      <label class="form-control">
        <div class="label">
          <span class="label-text">Quantity</span>
          {#if form.status === "Wishlist"}
            <span class="label-text-alt opacity-70"> Locked for wishlist </span>
          {/if}
        </div>
        <div class="flex w-full items-center gap-2">
          <button
            class="btn btn-square no-animation"
            type="button"
            disabled={!canDec}
            aria-disabled={!canDec}
            aria-label="Decrease quantity"
            onclick={() => {
              if (!canDec) return;
              form.quantity = Math.max(MIN_QUANTITY, form.quantity - 1);
            }}
            onmousedown={(e) => e.preventDefault()}
          >
            <i class="fa-solid fa-minus"></i>
          </button>

          <NumberFlow
            value={form.quantity}
            plugins={[continuous]}
            aria-live="polite"
          />

          <input
            type="number"
            name="quantity"
            class="hidden"
            bind:value={form.quantity}
          />

          <button
            class="btn btn-square no-animation"
            type="button"
            disabled={!canInc}
            aria-disabled={!canInc}
            aria-label="Increase quantity"
            onclick={() => {
              if (!canInc) return;
              form.quantity = Math.min(MAX_QUANTITY, form.quantity + 1);
            }}
            onmousedown={(e) => e.preventDefault()}
          >
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </label>

      <!-- Main cube -->
      <label class="form-control">
        <div class="label">
          <span class="label-text">Main Cube</span>
          <span class="label-text-alt opacity-70"> Shows as your primary </span>
        </div>
        <div class="join">
          <input
            type="checkbox"
            name="main"
            bind:checked={form.main}
            class="toggle join-item bg-base-100"
            aria-label="Set as main cube"
          />
        </div>
      </label>

      <!-- Condition -->
      <label class="form-control md:col-span-1">
        <div class="label"><span class="label-text">Condition</span></div>
        <select
          name="condition"
          bind:value={form.condition}
          class="select select-bordered rounded-xl w-full"
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
      <label class="form-control md:col-span-1">
        <div class="label"><span class="label-text">Status</span></div>
        <select
          name="status"
          bind:value={form.status}
          class="select select-bordered rounded-xl w-full"
          required
        >
          <option value="Owned">Owned</option>
          <option value="Wishlist">Wishlist</option>
          <option value="Loaned">Loaned</option>
          <option value="Borrowed">Borrowed</option>
          <option value="Lost">Lost</option>
        </select>
      </label>

      <label class="form-control">
        <div class="label"><span class="label-text">Bought From</span></div>
        <select
          name="bought_from"
          bind:value={form.bought_from}
          class="select select-bordered rounded-xl w-full"
        >
          <option value={null}>None</option>
          {#each vendors as vendor (vendor.slug)}
            <option value={vendor.slug}>{vendor.name}</option>
          {/each}
        </select>
      </label>

      <label class="form-control">
        <div class="label">
          <span class="label-text">Purchase Price</span>
          <span class="label-text-alt opacity-70">Optional</span>
        </div>
        <label class="input flex items-center gap-2 rounded-xl">
          <span aria-hidden="true">$</span>
          <input
            type="number"
            name="purchase_price"
            bind:value={form.purchase_price}
            class="grow"
            min="0"
            max="100000"
            step="0.01"
            placeholder="0.00"
            inputmode="decimal"
          />
        </label>
      </label>

      <!-- Notes (full width on md) -->
      <label class="form-control md:col-span-2">
        <div class="label">
          <span class="label-text">Notes</span>
          <span class="label-text-alt opacity-70">Optional</span>
        </div>
        <textarea
          name="notes"
          placeholder="Lubed with..., setup..., special mod..., etc."
          bind:value={form.notes}
          class="textarea textarea-bordered rounded-2xl w-full min-h-24"
          maxlength="2000"></textarea>
      </label>

      <!-- Acquired date -->
      <label class="form-control md:col-span-1">
        <div class="label">
          <span class="label-text">Acquired on</span>
          <span class="label-text-alt opacity-70">Optional</span>
        </div>
        <input
          name="acquiredAt"
          type="date"
          bind:value={form.acquired_at}
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
          You must be logged in to perform this action.
        {/if}
      </div>

      <div class="flex gap-2">
        <button
          class="btn btn-ghost rounded-xl"
          type="button"
          onclick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          class="btn btn-primary rounded-xl"
          type="submit"
          disabled={isSubmitting || !isConnected}
        >
          {#if isSubmitting}
            <span class="loading loading-spinner"></span>
            <span class="ml-2">{alreadyAdded ? "Editing…" : "Adding…"}</span>
          {:else if showSuccess}
            <i class="fa-solid fa-check mr-2" aria-hidden="true"></i>
            {alreadyAdded ? "Edited!" : "Added!"}
          {:else}
            {alreadyAdded ? "Edit Cube" : "Add Cube"}
          {/if}
        </button>
      </div>
    </div>
  </form>
</Modal>
