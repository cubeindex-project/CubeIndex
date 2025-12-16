<script lang="ts">
  import type { AutofillResult } from "../../../routes/(api)/api/submit/autocomplete/+server";
  import { cleanLink } from "../helper_functions/linkCleaner";
  import Card from "../layout/card.svelte";

  let {
    onCancel,
    applyData,
    variables = $bindable(),
    dirty,
  } = $props<{
    onCancel: () => void;
    applyData: (data: AutofillResult) => void;
    variables: {
      storeUrl: string;
      errorMessage: string;
      loading: boolean;
      success: boolean;
    };
    dirty: boolean;
  }>();

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

    onCancel();

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

<Card>
  <div class="flex items-start gap-3">
    <div class="flex-1 space-y-1">
      <h2 id="add-cube-title" class="card-title leading-tight">
        Autofill Service
      </h2>
      <p class="text-sm text-base-content/70">
        Paste the exact product page for this cube from a shop like
        SpeedCubeShop, DailyPuzzles, or a manufacturer store. We will scan it
        and fill what we can.
      </p>
    </div>
    <button
      type="button"
      class="btn btn-ghost btn-sm rounded-xl"
      onclick={onCancel}
      aria-label="Close"
    >
      &Cross;
    </button>
  </div>

  <form class="space-y-4 pt-4" onsubmit={requestAutofill}>
    <label class="flex flex-col gap-2 text-sm font-medium text-base-content/80">
      Store product link
      <input
        type="url"
        placeholder="https://www.speedcubeshop.com/products/..."
        class="input input-md w-full"
        bind:value={variables.storeUrl}
        autocomplete="off"
        required
      />
      <span class="text-xs text-base-content/60">
        Use a page with clear specs and the exact model you are submitting—no
        shortened links.
      </span>
    </label>

    <div class="flex flex-col gap-2">
      <div class="flex gap-2">
        <button
          type="submit"
          class="btn btn-primary flex-1 text-primary-content"
          aria-live="polite"
        >
          {#if variables.loading}
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Requesting autofill...</span>
          {:else}
            <span>Send link</span>
          {/if}
        </button>
        <button type="button" class="btn btn-ghost" onclick={onCancel}>
          Cancel
        </button>
      </div>
      {#if variables.success}
        <div class="alert alert-success text-sm">
          <i class="fa-solid fa-bolt"></i>
          <span> Link processed. </span>
        </div>
      {:else if variables.errorMessage}
        <div class="alert alert-error text-sm">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>{variables.errorMessage}</span>
        </div>
      {:else if dirty}
        <div class="alert alert-warning text-sm">
          <i class="fa-solid fa-exclamation-triangle"></i>
          <span>This will overwrite your current data.</span>
        </div>
      {/if}
    </div>
  </form>
</Card>
