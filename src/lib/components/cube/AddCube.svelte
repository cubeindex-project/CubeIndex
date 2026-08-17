<script lang="ts">
  import NumberFlow, { continuous } from "@number-flow/svelte";
  import type { Tables } from "$lib/types/database.types";
  import { page } from "$app/state";
  import Modal from "$lib/components/ui/Modal.svelte";

  interface Props {
    open: boolean;
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
    open = $bindable(),
    cube,
    alreadyAdded,
    defaultData = DEFAULT_DATA,
  }: Props = $props();

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

  const vendors = $derived(page.data.vendors);

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
        setTimeout(() => (open = false), 900);
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
  bind:open
  title={alreadyAdded ? "Edit Cube" : "Add to Collection"}
  description={cube.name}
>
  {#if formMessage || !isConnected}
    <div class="alert alert-error" aria-live="polite" aria-atomic="true">
      {formMessage}
      {#if !isConnected}
        You must be logged in to perform this action.
      {/if}
    </div>
  {/if}

  <form onsubmit={addCubeToCollection} method="dialog">
    <div class="flex justify-between items-center">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Quantity</legend>
        {#if form.status === "Wishlist"}
          <p class="label">Locked for wishlist</p>
        {/if}
        <div class="join w-fit">
          <button
            class="btn btn-outline join-item flex-1 sm:flex-none"
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
            <i class="fa-solid fa-minus" aria-hidden="true"></i>
          </button>

          <output
            class="btn join-item min-w-24 bg-base-200 text-lg font-semibold"
            aria-live="polite"
            aria-label="Quantity"
          >
            <NumberFlow value={form.quantity} plugins={[continuous]} />
          </output>

          <button
            class="btn btn-outline join-item flex-1 sm:flex-none"
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
            <i class="fa-solid fa-plus" aria-hidden="true"></i>
          </button>
        </div>

        <input
          type="number"
          name="quantity"
          class="hidden"
          bind:value={form.quantity}
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Main Cube</legend>
        <input
          type="checkbox"
          name="main"
          bind:checked={form.main}
          class="toggle"
          aria-label="Set as main cube"
        />
      </fieldset>
    </div>

    <div class="flex gap-6">
      <fieldset class="fieldset flex-1">
        <legend class="fieldset-legend">Condition</legend>
        <select
          name="condition"
          class="select w-full"
          bind:value={form.condition}
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
      </fieldset>

      <fieldset class="fieldset flex-1">
        <legend class="fieldset-legend">Status</legend>
        <select
          name="status"
          bind:value={form.status}
          class="select w-full"
          required
        >
          <option value="Owned">Owned</option>
          <option value="Wishlist">Wishlist</option>
          <option value="Loaned">Loaned</option>
          <option value="Borrowed">Borrowed</option>
          <option value="Lost">Lost</option>
        </select>
      </fieldset>
    </div>

    <div class="flex gap-6">
      <fieldset class="fieldset flex-1">
        <legend class="fieldset-legend">Bought From</legend>
        <select
          name="bought_from"
          bind:value={form.bought_from}
          class="select w-full"
        >
          <option value={null}>None</option>
          {#each vendors as vendor (vendor.slug)}
            <option value={vendor.slug}>{vendor.name}</option>
          {/each}
        </select>
      </fieldset>

      <fieldset class="fieldset flex-1">
        <legend class="fieldset-legend">Purchase Price</legend>
        <label class="input w-full">
          <span aria-hidden="true">$</span>
          <input
            type="number"
            name="purchase_price"
            bind:value={form.purchase_price}
            min="0"
            max="100000"
            step="0.01"
            placeholder="0.00"
            inputmode="decimal"
          />
        </label>
        <p class="label">Optional</p>
      </fieldset>
    </div>

    <fieldset class="fieldset">
      <legend class="fieldset-legend">Acquired on</legend>
      <input
        name="acquiredAt"
        type="date"
        bind:value={form.acquired_at}
        class="input w-full"
        max={new Date().toISOString().slice(0, 10)}
      />
      <p class="label">Optional</p>
    </fieldset>

    <fieldset class="fieldset">
      <legend class="fieldset-legend">Notes</legend>
      <textarea
        name="notes"
        placeholder="Lubed with..., setup..., special mod..., etc."
        bind:value={form.notes}
        class="textarea w-full rounded-2xl"
        maxlength="2000"></textarea>
      <p class="label">Optional</p>
    </fieldset>

    <div class="modal-action flex gap-3 sm:justify-end">
      <button
        class="btn flex-1 sm:flex-none"
        type="button"
        onclick={() => (open = false)}
        disabled={isSubmitting}
      >
        Cancel
      </button>

      <button
        class="btn btn-primary flex-1 sm:flex-none"
        type="submit"
        disabled={isSubmitting || !isConnected}
      >
        {#if isSubmitting}
          <span class="loading loading-spinner"></span>
          {alreadyAdded ? "Editing…" : "Adding…"}
        {:else if showSuccess}
          <i class="fa-solid fa-check" aria-hidden="true"></i>
          {alreadyAdded ? "Edited!" : "Added!"}
        {:else}
          {alreadyAdded ? "Edit Cube" : "Add Cube"}
        {/if}
      </button>
    </div>
  </form>
</Modal>
