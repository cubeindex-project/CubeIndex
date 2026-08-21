<script lang="ts">
  interface FormError {
    path: string;
    messages: string[];
  }

  interface Props {
    submitLabel: string;
    submitting: boolean;
    submissionNote?: string;
    message?: string;
    allErrors?: FormError[];
  }

  let {
    submitLabel,
    submitting,
    submissionNote,
    message,
    allErrors = [],
  }: Props = $props();
</script>

<div class="flex flex-col gap-3">
  <button
    type="submit"
    class="btn btn-primary btn-lg w-full"
    disabled={submitting}
  >
    {#if submitting}<span class="loading loading-spinner"></span>{/if}
    {submitLabel}
  </button>
  {#if submissionNote}
    <p class="text-center text-xs text-base-content/60">{submissionNote}</p>
  {/if}
</div>

{#if message}
  <div class="alert alert-success" role="status" aria-live="polite">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    <span>{@html message}</span>
  </div>
{/if}

{#if allErrors.length}
  <div class="alert alert-error" role="alert" aria-live="assertive">
    <div>
      <h2 class="text-sm font-semibold uppercase tracking-wide">
        Please fix the highlighted fields
      </h2>
      <ul class="mt-2 list-disc space-y-1 pl-4 text-sm">
        {#each allErrors as error (error.path)}
          <li>
            <span class="font-semibold text-base-content">{error.path}:</span>
            {error.messages.join(". ")}
          </li>
        {/each}
      </ul>
    </div>
  </div>
{/if}
