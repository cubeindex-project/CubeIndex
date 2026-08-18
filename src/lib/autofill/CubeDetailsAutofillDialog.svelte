<script lang="ts">
  import Modal from "$lib/components/ui/Modal.svelte";
  import { autofillCubeDetails } from "./client";
  import type { AutofillState, CubeDetailsAutofillResult } from "./types";

  interface Props {
    open: boolean;
    applyData: (data: CubeDetailsAutofillResult) => void;
    autofill: AutofillState;
    dirty: boolean;
  }

  let { open, applyData, autofill = $bindable(), dirty }: Props = $props();

  async function submitAutofillRequest(e: SubmitEvent) {
    e.preventDefault();

    // Reset UI state for a new request
    autofill.success = false;
    autofill.errorMessage = "";
    autofill.loading = true;

    // Close the card
    open = false;

    try {
      const autoFillResult: CubeDetailsAutofillResult =
        await autofillCubeDetails(autofill.storeURL);
      applyData(autoFillResult);
      autofill.success = true;
    } catch (err) {
      autofill.errorMessage =
        err instanceof Error
          ? err.cause instanceof Error
            ? err.cause.message
            : err.message
          : "Something went wrong while contacting the autofill service.";
    } finally {
      autofill.loading = false;
    }
  }
</script>

<Modal
  {open}
  title="Autofill Service"
  description="Paste the exact product page of the cube you want to add from a store. We will scan it and fill what we can."
>
  <form class="space-y-4" onsubmit={submitAutofillRequest}>
    <label class="flex flex-col gap-2 text-sm font-medium text-base-content/80">
      Store product link
      <input
        type="url"
        class="input input-md w-full"
        bind:value={autofill.storeURL}
        autocomplete="off"
        required
      />
    </label>

    <div class="flex flex-col gap-2">
      <div class="flex justify-end gap-2">
        <button
          type="submit"
          class="btn btn-primary text-primary-content w-full"
          aria-live="polite"
        >
          {#if autofill.loading}
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Fetching data...</span>
          {:else}
            <span>Send link</span>
          {/if}
        </button>
      </div>
      {#if autofill.success}
        <div class="alert alert-success text-sm">
          <i class="fa-solid fa-bolt"></i>
          <span> Link processed. </span>
        </div>
      {:else if autofill.errorMessage}
        <div class="alert alert-error text-sm">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>{autofill.errorMessage}</span>
        </div>
      {:else if dirty}
        <div class="alert alert-warning text-sm">
          <i class="fa-solid fa-exclamation-triangle"></i>
          <span>This will overwrite your current data.</span>
        </div>
      {/if}
    </div>
  </form>
</Modal>
