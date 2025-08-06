<script lang="ts">
  import { getContext } from "svelte";
  import { blur } from "svelte/transition";

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

  let isConnected = getContext("user");

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

  async function sendReport() {
    isSubmitting = true;
    formMessage = "";
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
        setTimeout(onCancel, 1000);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      formMessage = err.message;
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div
  class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
  transition:blur
>
  <form
    class="card max-w-lg transform absolute z-50 backdrop-blur-3xl bg-base-100/80 backdrop-opacity-100 flex items-center mx-1"
    onsubmit={sendReport}
  >
    <div class="card-body min-w-full">
      <h2 class="card-title">
        You are reporting {reporLabel}
      </h2>

      <div class="mt-4 space-y-4">
        <label class="flex flex-col">
          <span class="label-text"
            >Title <span class="text-red-500">*</span></span
          >
          <input bind:value={title} class="input rounded-2xl w-full max-h-50" />
        </label>
      </div>

      <!-- Full-width fields -->
      <div class="mt-4 space-y-4">
        <label class="flex flex-col">
          <span class="label-text"
            >Comment <span class="text-red-500">*</span></span
          >
          <textarea
            bind:value={comment}
            class="textarea textarea-bordered rounded-2xl w-full max-h-50"
          ></textarea>
        </label>
      </div>

      <div class="mt-4 space-y-4">
        <label class="flex flex-col">
          <span class="label-text">Image URL</span>
          <input
            bind:value={imageUrl}
            type="url"
            class="input rounded-2xl w-full max-h-50"
          />
        </label>
      </div>
    </div>

    <div class="flex justify-between w-full">
      <div class="card-actions p-4">
        <button
          class="btn btn-secondary"
          type="button"
          onclick={onCancel}
          disabled={isSubmitting}>Cancel</button
        >
      </div>

      <div class="card-actions p-4">
        <button
          class="btn btn-primary"
          type="submit"
          disabled={isSubmitting || !isConnected}
        >
          {#if isSubmitting}
            <span class="loading loading-spinner"></span>
            Reporting...
          {:else if showSuccess}
            <i class="fa-solid fa-check"></i>
            Reported!
          {:else}
            Send Report
          {/if}
        </button>
      </div>
    </div>

    {#if formMessage}
      <div class="text-error pb-2 flex justify-center">{formMessage}</div>
    {/if}
    {#if !isConnected}
      <p class="text-error pb-2 flex justify-center">
        You must be logged in to perform this action
      </p>
    {/if}
  </form>
</div>
