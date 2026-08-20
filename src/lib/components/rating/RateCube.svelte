<script lang="ts">
  import StarRating from "./StarRating.svelte";
  import { page } from "$app/state";
  import Modal from "$lib/components/ui/Modal.svelte";
  import type { Tables } from "$lib/types/database.types";

  interface Props {
    open: boolean;
    cube: Tables<"cube_models">;
    rating?: number;
    comment?: string;
  }

  let { open = $bindable(), cube, rating = 0, comment = "" }: Props = $props();

  const user = $derived(page.data.user);

  let isConnected = $derived(Boolean(user));

  let isSubmitting = $state(false);
  let showSuccess = $state(false);
  let formMessage = $state("");

  const slug = $derived(cube.slug);

  const MAX_COMMENT_LENGTH = 500;
  const usedCharacters = $derived(comment.length);
  const remainingCharacters = $derived(MAX_COMMENT_LENGTH - usedCharacters);
  const usedPercentage = $derived(
    Math.min(100, Math.round((usedCharacters / MAX_COMMENT_LENGTH) * 100)),
  );
  const isNearLimit = $derived(usedCharacters >= MAX_COMMENT_LENGTH * 0.9);
  const isOverLimit = $derived(usedCharacters > MAX_COMMENT_LENGTH);

  function validate(): string | null {
    if (!isConnected) return "You must be logged in to perform this action.";
    if (!rating || rating < 1) return "Please select a rating.";
    if (isOverLimit)
      return `Comment is too long by ${usedCharacters - MAX_COMMENT_LENGTH} characters.`;
    return null;
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
        setTimeout(() => (open = false), 900);
      } else {
        throw new Error(
          data?.error || "Unable to submit rating. Please try again.",
        );
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

<Modal
  bind:open
  title="Rate this Cube"
  description={`${cube.series} ${cube.model}${cube.version_type !== "Base" ? ` · ${cube.version_name}` : ""}`}
>
  {#if formMessage || !isConnected}
    <div class="alert alert-error" aria-live="polite" aria-atomic="true">
      {formMessage}
      {#if !isConnected}
        You must be logged in to perform this action.
      {/if}
    </div>
  {/if}

  <form onsubmit={rateCube} method="dialog">
    <fieldset class="fieldset">
      <legend class="fieldset-legend">Your rating</legend>
      <StarRating readOnly={false} bind:rating />
      <p class="label">Click a star to set your rating.</p>
    </fieldset>

    <fieldset class="fieldset">
      <div class="flex items-center justify-between">
        <legend class="fieldset-legend">Comment</legend>
        <span class="label">Max {MAX_COMMENT_LENGTH}</span>
      </div>

      <div class="relative">
        <textarea
          name="comment"
          bind:value={comment}
          rows="4"
          placeholder="Share your thoughts about turning feel, speed, control, magnet strength, etc."
          class="textarea w-full resize-y rounded-2xl pr-12"
          aria-describedby="comment-character-meter"
          maxlength={MAX_COMMENT_LENGTH + 100}></textarea>

        <div class="absolute right-3 bottom-3 place-items-center">
          <div
            class="radial-progress select-none {isOverLimit
              ? 'text-error'
              : isNearLimit
                ? 'text-warning'
                : 'text-primary'}"
            style="--value:{usedPercentage}; --size:1.75rem; --thickness:3px"
            aria-live="polite"
            aria-label={`Characters: ${usedCharacters}/${MAX_COMMENT_LENGTH}${isOverLimit ? " (over limit)" : ""}`}
            title={`${usedCharacters}/${MAX_COMMENT_LENGTH}`}
          >
            {#if isNearLimit || isOverLimit}{remainingCharacters}{/if}
          </div>
        </div>
      </div>
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
        disabled={isSubmitting || !isConnected || !rating || isOverLimit}
        aria-disabled={isSubmitting || !isConnected || !rating || isOverLimit}
        title={!rating
          ? "Please select a rating"
          : isOverLimit
            ? "Comment too long"
            : ""}
      >
        {#if isSubmitting}
          <span class="loading loading-spinner"></span>
          Submitting…
        {:else if showSuccess}
          <i class="fa-solid fa-check" aria-hidden="true"></i>
          Rated!
        {:else}
          Rate Cube
        {/if}
      </button>
    </div>
  </form>
</Modal>
