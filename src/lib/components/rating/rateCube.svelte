<script lang="ts">
  import { blur } from "svelte/transition";
  import StarRating from "./starRating.svelte";
  import { getContext } from "svelte";

  let { onCancel, cube, rating = 0, comment = "" } = $props();

  let isConnected = typeof getContext("user") !== undefined;

  let isSubmitting = $state(false);
  let showSuccess = $state(false);
  let formMessage = $state("");

  let slug = $derived(cube.slug);

  async function rateCube() {
    isSubmitting = true;
    formMessage = "";
    const payload: {
      cube_slug: string;
      rating: number;
      comment: string;
    } = {
      cube_slug: slug,
      rating,
      comment,
    };

    try {
      const res = await fetch("/api/rating/add-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess = true;
        setTimeout(onCancel(), 1000);
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
  <div
    class="card max-w-lg transform absolute z-50 backdrop-blur-3xl bg-base-100/80 backdrop-opacity-100 flex items-center mx-1"
  >
    {#if isConnected}
      <form onsubmit={rateCube}>
        <div class="card-body min-w-full">
          <h2 class="card-title">
            You are rating the {cube.series}
            {cube.model}
            {cube.version_type !== "Base" ? cube.version_name : null}
          </h2>

          <StarRating readOnly={false} bind:rating />

          <!-- Full-width fields -->
          <div class="mt-4 space-y-4">
            <label class="flex flex-col">
              <span class="label-text">Comment</span>
              <textarea
                bind:value={comment}
                class="textarea textarea-bordered rounded-2xl w-full max-h-50 resize max-w-md"
              ></textarea>
            </label>
          </div>
        </div>

        <div class="flex justify-between">
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
              disabled={isSubmitting}
            >
              {#if isSubmitting}
                <span class="loading loading-spinner"></span>
                Rating...
              {:else if showSuccess}
                <i class="fa-solid fa-check"></i>
                Rated!
              {:else}
                Rate Cube
              {/if}
            </button>
          </div>
        </div>

        {#if formMessage}
          <div class="text-error p-2 flex justify-center">{formMessage}</div>
        {/if}
      </form>
    {:else}
      <div class="card-body w-full">
        <h2 class="card-title">
          Log In or Create an Account to rate {cube.series}
          {cube.model}
          {cube.version_type !== "Base" ? cube.version_name : ""}.
        </h2>

        <div class="flex justify-between">
          <div class="card-actions p-4">
            <button class="btn btn-secondary" type="button" onclick={onCancel}
              >Cancel</button
            >
          </div>

          <div class="card-actions p-4">
            <a class="btn btn-primary" href="/auth/signup"> Sign Up </a>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
