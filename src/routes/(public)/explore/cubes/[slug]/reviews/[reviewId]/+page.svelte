<script lang="ts">
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte.js";
  import StarRating from "$lib/components/rating/starRating.svelte";
  import Avatar from "$lib/components/user/avatar.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let { cube, review } = $derived(data);

  const pageTitle = $derived(`${cube.name} - Review`);
  const reviewText = $derived(review.review.trim());

  const ratingsEntries = $derived.by(() =>
    Object.entries(review.ratings).sort(([a], [b]) => a.localeCompare(b)),
  );

  let isHelpful = $state(data.isHelpful);
  let helpfulCount = $derived(review.helpful_count);
  let isSubmitting = $state(false);
  let helpfulError = $state("");

  async function toggleHelpful() {
    if (isSubmitting) return;
    isSubmitting = true;
    helpfulError = "";
    try {
      const response = await fetch("/api/reviews/helpful", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: review.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        helpfulError = data.error ?? "An unexpected error occurred";
        return;
      }

      if (data.action === "add") {
        helpfulCount += 1;
      } else {
        helpfulCount -= 1;
      }

      isHelpful = !isHelpful;
    } catch {
      helpfulError = "An unexpected error occurred";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<section class="space-y-6">
  <header class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <a
        class="btn btn-ghost btn-sm"
        href="/explore/cubes/{cube.slug}/reviews"
        data-sveltekit-noscroll
      >
        <i class="fa-solid fa-arrow-left mr-2"></i>
        All reviews
      </a>
    </div>
  </header>

  <article class="rounded-2xl border border-base-300 bg-base-200 p-6">
    <header
      class="flex flex-col gap-4 mb-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div class="flex items-center gap-3 min-w-0">
        <Avatar
          profile={{
            display_name: review.profile.display_name,
            profile_picture: review.profile.profile_picture,
          }}
          imgSize="size-12"
          textSize="text-lg"
        />

        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <a
              class="link link-hover font-semibold truncate"
              href="/user/{review.profile?.username}"
            >
              {review.profile?.display_name}
            </a>
          </div>

          <div
            class="mt-0.5 flex flex-wrap items-center gap-2 text-xs opacity-70"
          >
            <span title="Last update">
              {formatDate(review.updated_at ?? review.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between gap-3 sm:justify-end">
        <div class="flex flex-col items-end gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline inline-flex items-center whitespace-nowrap"
            aria-pressed={isHelpful}
            onclick={toggleHelpful}
            disabled={isSubmitting}
          >
            <i
              class={isHelpful
                ? "fa-solid fa-thumbs-up"
                : "fa-regular fa-thumbs-up"}
            ></i>

            <span class="ml-2 whitespace-nowrap">Helpful</span>

            <span
              class="ml-2 badge badge-ghost badge-sm tabular-nums whitespace-nowrap"
            >
              {helpfulCount}
            </span>
          </button>

          {#if helpfulError}
            <p class="text-sm text-error">{helpfulError}</p>
          {/if}
        </div>
      </div>
    </header>

    <h3 class="text-base font-semibold leading-snug">
      {review.title}
    </h3>

    <p class="whitespace-pre-line leading-relaxed">{reviewText}</p>
  </article>

  <section class="rounded-2xl border border-base-300 bg-base-200 p-6">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {#each ratingsEntries as [label, rating] (label)}
        <div class="flex items-center justify-between gap-3">
          <span class="text-sm opacity-70">{label}</span>
          <StarRating readOnly={true} {rating} />
        </div>
      {/each}
    </div>
  </section>
</section>
