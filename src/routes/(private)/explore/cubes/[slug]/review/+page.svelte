<script lang="ts">
  import StarRating from "$lib/components/rating/starRating.svelte";
  import type { RatingsPayload } from "../../../../../(api)/api/reviews/ratings/+server";

  const TITLE_MAX_LENGTH = 80;
  const REVIEW_MIN_LENGTH = 1000;

  type Snapshot = {
    title: string;
    reviewContent: string;
    ratings: Array<[number, number]>;
  };

  const { data } = $props();
  const { review, categoryRatings, reviewCategories } = $derived(data);

  // The svelte-ignore is a temporary fix, this page will be refactored with superForms
  // svelte-ignore state_referenced_locally
  let title = $state(review.title);
  // svelte-ignore state_referenced_locally
  let reviewContent = $state(review.review);
  // svelte-ignore state_referenced_locally
  let status = $state(review.status);

  function keyOf(s: Snapshot) {
    return JSON.stringify({
      title: s.title.trim(),
      review: s.reviewContent.trim(),
      ratings: [...s.ratings].sort((a, b) => a[0] - b[0]),
    });
  }

  const currentKey = $derived(
    keyOf({
      title,
      reviewContent,
      ratings: categoryRatings.map((c) => [c.id, c.rating]),
    }),
  );

  // svelte-ignore state_referenced_locally
  let baselineKey = $state(
    keyOf({
      title: review.title,
      reviewContent: review.review,
      ratings: reviewCategories.map((c) => [
        c.id,
        data.reviewRatings.get(c.id) ?? 0,
      ]),
    }),
  );

  const isDirty = $derived(currentKey !== baselineKey);

  function markClean() {
    baselineKey = currentKey;
  }

  const canPublish = $derived(reviewContent.trim().length >= REVIEW_MIN_LENGTH);

  let published = $state(false);
  const prettyStatus = $derived(
    status.charAt(0).toUpperCase() + status.slice(1),
  );

  const statusBadgeClass = (() => {
    if (status === "draft") return "badge-ghost";
    else if (status === "published") return "badge-success";
    else return "badge-neutral";
  })();

  async function setRatings() {
    const ratingsPayload: RatingsPayload = {
      slug: data.slug,
      ratings: categoryRatings.map((category) => ({
        category_id: category.id,
        rating: category.rating,
      })),
    };

    const ratingsResponse = await fetch("/api/reviews/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ratingsPayload),
    });

    const ratingsResponseData = await ratingsResponse.json();

    if (!ratingsResponse.ok) {
      throw new Error(ratingsResponseData.error ?? "Failed to set ratings");
    }
  }

  function check() {
    if (title.trim().length > TITLE_MAX_LENGTH)
      throw new Error("Title can not be longer than 80 characters");

    if (reviewContent.trim().length < REVIEW_MIN_LENGTH)
      throw new Error("Review must be at least 1000 characters long");
  }

  async function saveDraft() {
    const payload = { slug: data.slug, title, review };

    const response = await fetch("/api/reviews/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error ?? "Failed to save draft");
    }

    await setRatings();
    markClean();
  }

  async function publishReview() {
    check();

    const payload = { slug: data.slug, title, review };

    const response = await fetch("/api/reviews/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error ?? "Failed to save review");
    }

    await setRatings();
    markClean();

    published = true;

    setTimeout(() => {
      published = false;
      status = "published";
    }, 2000);
  }
</script>

<section class="mx-auto px-5 my-5 w-full max-w-4xl space-y-6 min-h-screen">
  <header
    class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
  >
    <div class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">
        Review of the {data.cubeName}
      </h1>
      <p class="text-sm opacity-70">
        Write a helpful review. Keep it specific: feel, performance, and who
        it’s for.
      </p>
    </div>

    <div class="flex items-center gap-2">
      <span class="badge {statusBadgeClass} whitespace-nowrap">
        {prettyStatus}
      </span>
      {#if isDirty}
        <span class="badge badge-warning">Unsaved</span>
      {/if}
    </div>
  </header>

  <div class="card border border-base-300 bg-base-200/60">
    <div class="flex flex-col md:flex-row">
      <div class="card-body space-y-5 flex-1">
        <div class="space-y-3">
          <h3 class="font-bold text-xl">Review</h3>
          <label class="fieldset">
            <div class="label">
              <span class="label-text font-medium">Title</span>
              <span class="label-text-alt opacity-70">
                {title.length}/{TITLE_MAX_LENGTH}
              </span>
            </div>

            <input
              class="input w-full"
              bind:value={title}
              autocomplete="off"
              maxlength={TITLE_MAX_LENGTH}
            />
          </label>

          <label class="fieldset">
            <div class="label">
              <span class="label-text font-medium">Main review</span>
              <span class="label-text-alt opacity-70">
                Min. {REVIEW_MIN_LENGTH} characters
              </span>
            </div>

            <textarea
              class="textarea min-h-45 w-full leading-relaxed"
              autocomplete="off"
              bind:value={reviewContent}></textarea>
          </label>
        </div>
      </div>

      <div class="card-body space-y-4 flex-1">
        <div class="space-y-1">
          <h3 class="font-bold text-xl">Rating</h3>
          <p class="text-sm opacity-70">
            Rate each category from 0.5 to 5 stars.
          </p>
        </div>

        <div class="space-y-4">
          {#each categoryRatings as category (category.id)}
            <div
              class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="font-medium">{category.label}</div>
              <StarRating readOnly={false} bind:rating={category.rating} />
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2 sm:flex-row sm:justify-end p-5">
      {#if status === "draft"}
        <button
          class="btn btn-outline"
          disabled={!isDirty}
          onclick={() => saveDraft()}
        >
          Save draft
        </button>
      {/if}

      <button
        class="btn"
        class:btn-primary={!published}
        class:btn-success={published}
        disabled={!canPublish || !isDirty}
        onclick={() => publishReview()}
      >
        {#if published}
          <i class="fa-solid fa-check"></i>
          {status === "draft" ? "Published" : "Edited"}
        {:else}
          {status === "draft" ? "Publish" : "Edit"}
        {/if}
      </button>
    </div>
  </div>
</section>
