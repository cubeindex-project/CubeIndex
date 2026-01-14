<script lang="ts">
  import { m } from "$lib/paraglide/messages";
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
    comment = m.report_dialog_bug_template_text();

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
    if (!isConnected) return m.report_dialog_auth_required_text();
    if (!title.trim()) return m.report_dialog_title_required_text();
    if (!comment.trim()) return m.report_dialog_comment_required_text();
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
        throw new Error(data.error || m.report_dialog_submit_failed_text());
      }
    } catch (err: any) {
      formMessage = err.message ?? m.report_dialog_unexpected_error_text();
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
          <h2 id="report-title" class="card-title leading-tight">
            {m.report_dialog_title_h2()}
          </h2>
          <p id="report-desc" class="text-sm opacity-80">
            {m.report_dialog_reporting_text({ label: reporLabel })}
          </p>
        </div>
        <button
          type="button"
          class="btn btn-ghost btn-sm rounded-xl"
          onclick={onCancel}
          aria-label={m.report_dialog_close_aria()}
        >
          ✕
        </button>
      </div>

      <!-- Fields -->
      <div class="space-y-4">
        <label class="form-control">
          <div class="label">
            <span class="label-text">{m.report_dialog_title_label()}</span>
            <span class="label-text-alt opacity-70">
              {m.report_dialog_required_label()}
            </span>
          </div>
          <input
            bind:value={title}
            class="input input-bordered rounded-xl w-full"
            required
          />
        </label>

        <label class="form-control">
          <div class="label">
            <span class="label-text">{m.report_dialog_comment_label()}</span>
            <span class="label-text-alt opacity-70">
              {m.report_dialog_required_label()}
            </span>
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
            <span class="label-text">{m.report_dialog_image_label()}</span>
            <span class="label-text-alt opacity-70">
              {m.report_dialog_optional_label()}
            </span>
          </div>
          <input
            bind:value={imageUrl}
            type="url"
            class="input input-bordered rounded-xl w-full"
            placeholder={m.report_dialog_image_placeholder()}
          />
        </label>
      </div>

      <!-- Status / errors -->
      <div class="min-h-5 text-sm text-error" aria-live="polite" aria-atomic="true">
        {formMessage}
        {#if !isConnected}
          {m.report_dialog_auth_required_text()}
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
          {m.report_dialog_cancel_cta()}
        </button>
        <button
          class="btn btn-primary rounded-xl"
          type="submit"
          disabled={isSubmitting || !isConnected}
        >
          {#if isSubmitting}
            <span class="loading loading-spinner"></span>
            <span class="ml-2">{m.report_dialog_submit_loading_text()}</span>
          {:else if showSuccess}
            <i class="fa-solid fa-check mr-2" aria-hidden="true"></i>
            {m.report_dialog_submit_success_text()}
          {:else}
            {m.report_dialog_submit_cta()}
          {/if}
        </button>
      </div>
    </div>
  </form>
</div>
