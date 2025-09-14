<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { fade, scale } from "svelte/transition";
  import Portal from "../misc/portal.svelte";
  import NumberFlow, { continuous } from "@number-flow/svelte";
  import { supabase } from "$lib/supabaseClient";

  type Status = "Owned" | "Wishlist" | "Loaned" | "Borrowed" | "Lost";
  type Condition =
    | "New in box"
    | "New"
    | "Good"
    | "Fair"
    | "Worn"
    | "Poor"
    | "Broken";

  let {
    onCancel,
    cube,
    alreadyAdded,
    defaultData = {
      quantity: 1,
      condition: "" as Condition | "",
      main: false,
      status: "" as Status | "",
      bought_from: null,
      notes: "",
      acquired_at: "",
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
  let condition = $state<Condition | "">(defaultData.condition || "");
  let main = $state(defaultData.main);
  let status = $state<Status | "">(defaultData.status || "");
  let bought_from = $state(defaultData.bought_from || null);
  let notes = $state(defaultData.notes);
  let acquired_at = $state(defaultData.acquired_at);

  // sensible defaults
  $effect(() => {
    if (!status) status = "Owned";
    if (!condition) condition = "New";
  });

  // wishlist rule
  $effect(() => {
    const _ = status;
    if (status === "Wishlist") quantity = 1;
  });

  // simple client checks
  function validate(): string | null {
    if (!status) return "Please choose a status.";
    if (!condition) return "Please choose a condition.";
    if (!quantity || quantity < 1 || quantity > 999)
      return "Quantity must be between 1 and 999.";
    if (acquired_at) {
      const today = new Date().toISOString().slice(0, 10);
      if (acquired_at > today) return "Acquired date cannot be in the future.";
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
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      const list = Array.from(focusables).filter(
        (el) => !el.hasAttribute("inert")
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
    } catch (err: any) {
      throw Error(err.message);
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
      formMessage = "You must be logged in to perform this action.";
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
          data?.error || "Unable to add the cube. Please try again."
        );
      }
    } catch (err: any) {
      formMessage = err?.message ?? "Unexpected error. Please try again.";
    } finally {
      isSubmitting = false;
    }
  }

  let readonly: boolean = $state(false);
  $effect(() => {
    readonly = status === "Wishlist";
  });

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

<Portal>
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
              {alreadyAdded ? "Edit Cube" : "Add to Collection"}
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
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <!-- Form grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <!-- Quantity -->
          <label class="form-control">
            <div class="label">
              <span class="label-text">Quantity</span>
              {#if status === "Wishlist"}
                <span class="label-text-alt opacity-70">
                  Locked for wishlist
                </span>
              {/if}
            </div>
            <div class="flex w-full items-center gap-2">
              <button
                class="btn btn-square no-animation"
                type="button"
                disabled={!canDec}
                aria-disabled={!canDec}
                aria-label="Decrease quantity"
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
                aria-label="Increase quantity"
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
              <span class="label-text">Main Cube</span>
              <span class="label-text-alt opacity-70">
                Shows as your primary
              </span>
            </div>
            <div class="join">
              <input
                type="checkbox"
                name="main"
                bind:checked={main}
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
              bind:value={condition}
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
              bind:value={status}
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
              bind:value={bought_from}
              class="select select-bordered rounded-xl w-full"
            >
              <option value={null}>None</option>
              {#each vendors as vendor}
                <option value={vendor.slug}>{vendor.name}</option>
              {/each}
            </select>
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
              bind:value={notes}
              class="textarea textarea-bordered rounded-2xl w-full min-h-24"
              maxlength="2000"
            ></textarea>
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
              bind:value={acquired_at}
              class="input input-bordered rounded-xl w-full"
              max={new Date().toISOString().slice(0, 10)}
            />
          </label>
        </div>

        <!-- Footer -->
        <div
          class="flex flex-col md:flex-row gap-3 justify-between items-center"
        >
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
      </div>
    </form>
  </div>
</Portal>
