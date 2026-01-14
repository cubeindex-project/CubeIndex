<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  import { onMount } from "svelte";
  import { fade, scale } from "svelte/transition";
  import StarRating from "./starRating.svelte";
  import { getContext } from "svelte";

  let { onCancel, cube, rating = 0, comment = "" } = $props();

  const userCtx = getContext<any>("user");
  let isConnected = $derived(Boolean(userCtx?.id ?? userCtx));

  let isSubmitting = $state(false);
  let showSuccess = $state(false);
  let formMessage = $state("");

  const slug = $derived(cube.slug);

  // Limits & live meter
  const MAX = 500;
  const used = $derived(comment.length);
  const remaining = $derived(Math.max(0, MAX - used));
  const pct = $derived(Math.min(100, Math.round((used / MAX) * 100)));
  const near = $derived(used >= MAX * 0.9);
  const over = $derived(used > MAX);
  const ringClass = $derived(
    over ? "text-error" : near ? "text-warning" : "text-accent"
  );
  const charMeterLabel = $derived(
    over
      ? m.rating_char_meter_over_aria({ used, max: MAX })
      : m.rating_char_meter_aria({ used, max: MAX })
  );
  const charMeterTitle = $derived(
    m.rating_char_meter_title_text({ used, max: MAX })
  );
  const submitTitle = $derived(
    !rating
      ? m.rating_submit_missing_rating_title()
      : over
        ? m.rating_submit_over_limit_title()
        : ""
  );

  function validate(): string | null {
    if (!isConnected) return m.rating_auth_required_text();
    if (!rating || rating < 1) return m.rating_select_required_text();
    if (over)
      return m.rating_comment_too_long_text({ excess: used - MAX });
    return null;
  }

  // a11y: focus trap & esc to close
  let dialogEl: HTMLFormElement | null = null;
  let firstFocusable: HTMLTextAreaElement | null = null;

  onMount(() => {
    firstFocusable?.focus();
  });

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

  async function rateCube(e: SubmitEvent) {
    e.preventDefault();
    formMessage = "";

    const err = validate();
    if (err) {
      formMessage = err;
      return;
    }

    isSubmitting = true;
    const payload = { cube_slug: slug, rating, comment };

    try {
      const res = await fetch("/api/rating/add-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) {
        showSuccess = true;
        setTimeout(onCancel, 900); // fixed: pass function, don't invoke immediately
      } else {
        throw new Error(
          data?.error || m.rating_submit_failed_text()
        );
      }
    } catch (err: any) {
      formMessage = err?.message ?? m.rating_unexpected_error_text();
    } finally {
      isSubmitting = false;
    }
  }
</script>

  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm"
    transition:fade={{ duration: 120 }}
    onkeydown={onKeydown}
    role="none"
  >
    <!-- Dialog -->
    <form
      aria-labelledby="rate-cube-title"
      aria-describedby="rate-cube-desc"
      class="card w-full max-w-xl mx-3 shadow-2xl rounded-3xl ring-1 ring-base-300/60 bg-base-100/90 backdrop-blur supports-[backdrop-filter]:bg-base-100/80"
      onsubmit={rateCube}
      transition:scale={{ duration: 150, start: 0.95 }}
      bind:this={dialogEl}
    >
      <div class="card-body gap-6">
        <!-- Header -->
        <div class="flex items-start gap-3">
          <div class="flex-1">
            <h2 id="rate-cube-title" class="card-title leading-tight">
              {m.rating_dialog_title_h2()}
            </h2>
            <p id="rate-cube-desc" class="text-sm opacity-80">
              {cube.series}
              {cube.model}
              {cube.version_type !== "Base" ? ` · ${cube.version_name}` : ""}
            </p>
          </div>
          <button
            type="button"
            class="btn btn-ghost btn-sm rounded-xl"
            onclick={onCancel}
            aria-label={m.rating_dialog_close_aria()}
          >
            ✕
          </button>
        </div>

        <!-- Rating control -->
        <div class="space-y-2">
          <div class="label">
            <span class="label-text">{m.rating_label()}</span>
            <span class="label-text-alt opacity-70">{rating || 0}/5</span>
          </div>
          <StarRating readOnly={false} bind:rating />
          <p class="text-xs opacity-70">{m.rating_hint_text()}</p>
        </div>

        <!-- Comment -->
        <div class="relative">
          <div class="label">
            <span class="label-text">{m.rating_comment_label()}</span>
            <span class="label-text-alt opacity-70">
              {m.rating_comment_optional_text({ max: MAX })}
            </span>
          </div>

          <textarea
            bind:value={comment}
            rows="4"
            placeholder={m.rating_comment_placeholder()}
            class="textarea textarea-bordered rounded-2xl w-full resize-y pr-12"
            aria-describedby="char-meter"
            maxlength={MAX + 100}
            bind:this={firstFocusable}
          ></textarea>

          <!-- Character meter -->
          <div class="absolute bottom-3 right-3 grid place-items-center">
            <div
              id="char-meter"
              class="radial-progress {ringClass} select-none"
              style="--value:{pct}; --size:1.75rem; --thickness:3px"
              aria-live="polite"
              aria-label={charMeterLabel}
              title={charMeterTitle}
            >
              {#if near || over}{remaining}{/if}
            </div>
          </div>
        </div>

        <!-- Status / errors -->
        <div
          class="min-h-5 text-sm text-error"
          aria-live="polite"
          aria-atomic="true"
        >
          {formMessage}
          {#if !isConnected}
            {m.rating_auth_required_text()}
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
            {m.rating_cancel_cta()}
          </button>
          <button
            class="btn btn-primary rounded-xl"
            type="submit"
            disabled={isSubmitting || !isConnected || !rating || over}
            aria-disabled={isSubmitting || !isConnected || !rating || over}
            title={submitTitle}
          >
            {#if isSubmitting}
              <span class="loading loading-spinner"></span>
              <span class="ml-2">{m.rating_submit_loading_text()}</span>
            {:else if showSuccess}
              <i class="fa-solid fa-check mr-2" aria-hidden="true"></i>
              {m.rating_submit_success_text()}
            {:else}
              {m.rating_submit_cta()}
            {/if}
          </button>
        </div>
      </div>
    </form>
  </div>
