<script lang="ts">
  import type { AutofillResult } from "../../../routes/(api)/api/submit/autocomplete/+server";
  import { cleanLink } from "../../utils/linkCleaner";
  import Modal from "$lib/components/ui/Modal.svelte";

  interface Props {
    open: boolean;
    applyData: (data: AutofillResult) => void;
    variables: {
      storeUrl: string;
      errorMessage: string;
      loading: boolean;
      success: boolean;
    };
    dirty: boolean;
  }

  let {
    open = $bindable(),
    applyData,
    variables = $bindable(),
    dirty,
  }: Props = $props();

  async function requestAutofill(e: SubmitEvent) {
    e.preventDefault();

    // Reset UI state for a new request
    variables.success = false;
    variables.errorMessage = "";
    variables.loading = true;

    const sanitizedUrl = cleanLink(variables.storeUrl);

    if (!sanitizedUrl) {
      variables.errorMessage = "Add a product link before sending.";
      variables.loading = false;
      return;
    }

    open = false;

    try {
      const response = await fetch(
        `/api/submit/autocomplete?url=${encodeURIComponent(sanitizedUrl)}`,
      );

      const data = await response.json();

      if (!response.ok) {
        variables.errorMessage =
          data.error || "We could not process that link right now.";
        return;
      }

      applyData(data);
      variables.success = true;
    } catch {
      variables.errorMessage =
        "Something went wrong while contacting the autofill service.";
    } finally {
      variables.loading = false;
    }
  }
</script>

<Modal
  bind:open
  title="Autofill Service"
  description="Paste the exact product page for this cube from a shop or manufacturer store."
>
  {#if variables.success}
    <div class="alert alert-success text-sm" aria-live="polite">
      <i class="fa-solid fa-bolt" aria-hidden="true"></i>
      <span>Link processed.</span>
    </div>
  {:else if variables.errorMessage}
    <div class="alert alert-error text-sm" aria-live="polite">
      <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
      <span>{variables.errorMessage}</span>
    </div>
  {:else if dirty}
    <div class="alert alert-warning text-sm">
      <i class="fa-solid fa-exclamation-triangle" aria-hidden="true"></i>
      <span>This will overwrite your current data.</span>
    </div>
  {/if}

  <form onsubmit={requestAutofill} method="dialog">
    <fieldset class="fieldset">
      <legend class="fieldset-legend">Store product link</legend>
      <input
        type="url"
        name="store_url"
        placeholder="https://www.speedcubeshop.com/products/..."
        class="input w-full"
        bind:value={variables.storeUrl}
        autocomplete="off"
        required
      />
    </fieldset>

    <div class="modal-action flex gap-3 sm:justify-end">
      <button
        type="button"
        class="btn flex-1 sm:flex-none"
        onclick={() => (open = false)}
        disabled={variables.loading}
      >
        Cancel
      </button>

      <button
        type="submit"
        class="btn btn-primary flex-1 sm:flex-none"
        disabled={variables.loading}
        aria-live="polite"
      >
        {#if variables.loading}
          <span class="loading loading-spinner"></span>
          Requesting autofill…
        {:else}
          Send Link
        {/if}
      </button>
    </div>
  </form>
</Modal>
