<script lang="ts">
  import { m } from "$lib/paraglide/messages";
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
      variables.errorMessage = m.submit_autofill_missing_link_text();
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
          data.error || m.submit_autofill_process_failed_text();
        return;
      }

      applyData(data);
      variables.success = true;
    } catch {
      variables.errorMessage =
        m.submit_autofill_unexpected_error_text();
    } finally {
      variables.loading = false;
    }
  }
</script>

<Card title={m.submit_autofill_title()} {onCancel}>
  <div class="flex items-start gap-3">
    <p class="text-sm text-base-content/70">
      {m.submit_autofill_description_line_one()}
      <br />
      {m.submit_autofill_description_line_two()}
      <br />
      {m.submit_autofill_description_line_three()}
    </p>
  </div>

  <form class="space-y-4 pt-4" onsubmit={requestAutofill}>
    <label class="flex flex-col gap-2 text-sm font-medium text-base-content/80">
      {m.submit_autofill_link_label()}
      <input
        type="url"
        placeholder={m.submit_autofill_link_placeholder()}
        class="input input-md w-full"
        bind:value={variables.storeUrl}
        autocomplete="off"
        required
      />
      <span class="text-xs text-base-content/60">
        {m.submit_autofill_link_helper_text()}
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
            <span>{m.submit_autofill_requesting_text()}</span>
          {:else}
            <span>{m.submit_autofill_send_cta()}</span>
          {/if}
        </button>
        <button type="button" class="btn btn-ghost" onclick={onCancel}>
          {m.submit_autofill_cancel_cta()}
        </button>
      </div>
      {#if variables.success}
        <div class="alert alert-success text-sm">
          <i class="fa-solid fa-bolt"></i>
          <span>{m.submit_autofill_success_text()}</span>
        </div>
      {:else if variables.errorMessage}
        <div class="alert alert-error text-sm">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>{variables.errorMessage}</span>
        </div>
      {:else if dirty}
        <div class="alert alert-warning text-sm">
          <i class="fa-solid fa-exclamation-triangle"></i>
          <span>{m.submit_autofill_overwrite_warning_text()}</span>
        </div>
      {/if}
    </div>
  </form>
</Card>
