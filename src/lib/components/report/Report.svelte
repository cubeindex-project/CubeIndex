<script lang="ts">
  import { page } from "$app/state";
  import Modal from "$lib/components/ui/Modal.svelte";

  interface Props {
    open: boolean;
    reportType: "user" | "cube" | "cube-rating" | "website";
    reported: string;
    reporLabel: string;
  }

  let {
    open = $bindable(),
    reportType,
    reported,
    reporLabel,
  }: Props = $props();

  const user = $derived(page.data.user);
  let isConnected = $derived(Boolean(user));

  let isSubmitting = $state(false);
  let showSuccess = $state(false);
  let formMessage = $state("");

  let title = $state("");
  let comment = $state("");
  let imageUrl = $state("");

  // svelte-ignore state_referenced_locally
  if (reportType === "website")
    comment = `Describe the bug
A clear and concise description of what the bug is.

To Reproduce
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

Expected behavior
A clear and concise description of what you expected to happen.

Desktop (please complete the following information):
 - OS: [e.g. iOS]
 - Browser [e.g. chrome, safari]

Smartphone (please complete the following information):
 - Device: [e.g. iPhone6]
 - OS: [e.g. iOS8.1]
 - Browser [e.g. stock browser, safari]

Additional context
Add any other context about the problem here.`;

  function validate(): string | null {
    if (!isConnected) return "You must be logged in to perform this action.";
    if (!title.trim()) return "Please provide a title.";
    if (!comment.trim()) return "Please provide a comment.";
    return null;
  }

  async function sendReport(e: SubmitEvent) {
    e.preventDefault();
    isSubmitting = true;
    formMessage = "";

    const err = validate();
    if (err) {
      formMessage = err;
      isSubmitting = false;
      return;
    }

    const payload: {
      title: string;
      reported: string;
      comment: string;
      report_type: string;
      image_url: string;
    } = {
      title,
      reported,
      comment,
      report_type: reportType,
      image_url: imageUrl,
    };

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess = true;
        setTimeout(() => (open = false), 900);
      } else {
        throw new Error(data.error || "Unable to send report.");
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
</script>

<Modal bind:open title="Report" description={`You are reporting ${reporLabel}`}>
  {#if formMessage || !isConnected}
    <div class="alert alert-error" aria-live="polite" aria-atomic="true">
      {formMessage}
      {#if !isConnected}
        You must be logged in to perform this action.
      {/if}
    </div>
  {/if}

  <form onsubmit={sendReport} method="dialog">
    <fieldset class="fieldset">
      <legend class="fieldset-legend">Title</legend>
      <input name="title" bind:value={title} class="input w-full" required />
      <p class="label">Required</p>
    </fieldset>

    <fieldset class="fieldset">
      <legend class="fieldset-legend">Comment</legend>
      <textarea
        name="comment"
        bind:value={comment}
        class="textarea min-h-28 w-full rounded-2xl"
        maxlength="2000"
        required></textarea>
      <p class="label">Required</p>
    </fieldset>

    <fieldset class="fieldset">
      <legend class="fieldset-legend">Image URL</legend>
      <input
        name="image_url"
        bind:value={imageUrl}
        type="url"
        class="input w-full"
        placeholder="https://example.com/screenshot.png"
      />
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
          Reporting…
        {:else if showSuccess}
          <i class="fa-solid fa-check" aria-hidden="true"></i>
          Reported!
        {:else}
          Send Report
        {/if}
      </button>
    </div>
  </form>
</Modal>
