<script lang="ts">
  import { getContext } from "svelte";
  import { fade, scale } from "svelte/transition";

  let {
    onCancel,
    reportType,
    reported,
    reporLabel,
  }: {
    onCancel: () => void;
    reportType: "user" | "cube" | "cube-rating" | "website";
    reported: string;
    reporLabel: string;
  } = $props();

  const userCtx = getContext<any>("user");
  let isConnected = $derived(Boolean(userCtx?.id ?? userCtx));

  let isSubmitting = $state(false);
  let showSuccess = $state(false);
  let formMessage = $state("");

  let title = $state("");
  let comment = $state("");
  let imageUrl = $state("");

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

  // a11y: focus handling + esc/Tab
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
      const list = Array.from(focusables);
      if (!list.length) return;
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
        setTimeout(onCancel, 900);
      } else {
        throw new Error(data.error || "Unable to send report.");
      }
    } catch (err: any) {
      formMessage = err.message ?? "Unexpected error. Please try again.";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div
  class="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm"
  transition:fade={{ duration: 120 }}
  onkeydown={onKeydown}
  role="none"
>
  <form
    aria-labelledby="report-title"
    aria-describedby="report-desc"
    class="card w-full max-w-xl mx-3 shadow-2xl rounded-3xl ring-1 ring-base-300/60 bg-base-100/90 backdrop-blur supports-[backdrop-filter]:bg-base-100/80"
    onsubmit={sendReport}
    transition:scale={{ duration: 150, start: 0.95 }}
    bind:this={dialogEl}
  >
    <div class="card-body gap-6">
      <!-- Header -->
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <h2 id="report-title" class="card-title leading-tight">Report</h2>
          <p id="report-desc" class="text-sm opacity-80">
            You are reporting {reporLabel}
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

      <!-- Fields -->
      <div class="space-y-4">
        <label class="form-control">
          <div class="label">
            <span class="label-text">Title</span>
            <span class="label-text-alt opacity-70">Required</span>
          </div>
          <input
            bind:value={title}
            class="input input-bordered rounded-xl w-full"
            required
          />
        </label>

        <label class="form-control">
          <div class="label">
            <span class="label-text">Comment</span>
            <span class="label-text-alt opacity-70">Required</span>
          </div>
          <textarea
            bind:value={comment}
            class="textarea textarea-bordered rounded-2xl w-full min-h-28"
            maxlength="2000"
            required
          ></textarea>
        </label>

        <label class="form-control">
          <div class="label">
            <span class="label-text">Image URL</span>
            <span class="label-text-alt opacity-70">Optional</span>
          </div>
          <input
            bind:value={imageUrl}
            type="url"
            class="input input-bordered rounded-xl w-full"
            placeholder="https://example.com/screenshot.png"
          />
        </label>
      </div>

      <!-- Status / errors -->
      <div class="min-h-5 text-sm text-error" aria-live="polite" aria-atomic="true">
        {formMessage}
        {#if !isConnected}
          You must be logged in to perform this action.
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex flex-col sm:flex-row gap-2 justify-end">
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
            <span class="ml-2">Reporting...</span>
          {:else if showSuccess}
            <i class="fa-solid fa-check mr-2" aria-hidden="true"></i>
            Reported!
          {:else}
            Send Report
          {/if}
        </button>
      </div>
    </div>
  </form>
</div>
