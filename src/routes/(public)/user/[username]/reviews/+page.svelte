<script lang="ts">
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte.js";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let { profile, reviews } = $derived(data);

  const MAX_SUMMARY_CHARS = 200;

  const pageTitle = $derived(`${profile.display_name}'s Reviews - CubeIndex`);
  const reviewCount = $derived(reviews.length);

  function getSummary(review: string) {
    const raw = review.trim();
    if (raw.length <= MAX_SUMMARY_CHARS) return raw;
    return (
      raw
        .slice(0, MAX_SUMMARY_CHARS)
        .replace(/\s+\S*$/, "")
        .trim() + "…"
    );
  }
</script>

<div class="relative max-w-6xl mx-auto mt-12 px-4">
  <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight">
        {profile.display_name}'s reviews
      </h1>
      <p class="text-sm text-base-content/70">
        {reviewCount} review{reviewCount === 1 ? "" : "s"}
      </p>
    </div>
  </header>

  <div class="flex flex-col lg:flex-row gap-8">
    {#if reviewCount > 0}
      <ul class="flex flex-col gap-4">
        {#each reviews as review (review.id)}
          {@const summary = getSummary(review.review)}
          {@const cubeImage = review.cube_model?.image_url}

          <li>
            <article class="rounded-2xl border border-base-300 bg-base-200 p-5">
              <header
                class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div class="flex items-center gap-3 min-w-0">
                  {#if cubeImage}
                    <img
                      src={`https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_128/${cubeImage}`}
                      alt={review.cube_model.name}
                      class="size-12 rounded-xl object-cover"
                      loading="lazy"
                    />
                  {:else}
                    <div
                      class="size-12 rounded-xl bg-base-300/70 grid place-items-center"
                    >
                      <i class="fa-solid fa-cube text-lg opacity-60"></i>
                    </div>
                  {/if}

                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <a
                        class="link link-hover font-semibold truncate"
                        href="/explore/cubes/{review.cube}"
                      >
                        {review.cube_model.name}
                      </a>

                      {#if review.helpful_count > 0}
                        <span class="badge badge-ghost badge-sm tabular-nums">
                          <i class="fa-regular fa-thumbs-up mr-1"></i>
                          {review.helpful_count}
                        </span>
                      {/if}
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

                <div class="flex items-center gap-2">
                  <a
                    href="/explore/cubes/{review.cube}/reviews/{review.id}"
                    class="btn btn-sm btn-primary btn-outline"
                    aria-label="Open full review"
                  >
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    <span>Read</span>
                  </a>
                </div>
              </header>

              <section class="mt-4">
                <h3 class="text-base font-semibold leading-snug">
                  {review.title}
                </h3>

                <p class="mt-2 text-sm opacity-80 leading-relaxed">
                  {summary}
                </p>

                {#if review.review.length > MAX_SUMMARY_CHARS}
                  <div class="mt-2">
                    <a
                      href="/explore/cubes/{review.cube}/reviews/{review.id}"
                      class="link link-primary text-sm"
                    >
                      Read more
                    </a>
                  </div>
                {/if}
              </section>
            </article>
          </li>
        {/each}
      </ul>
    {:else}
      <div class="flex flex-col items-center justify-center py-20">
        <i class="fa-solid fa-comment-dots fa-3x mb-4"></i>
        <h2 class="text-2xl font-semibold mb-2">No reviews yet</h2>
        <p class="mb-6 text-center max-w-xs text-base-content/70">
          This user hasn't published any reviews yet.
        </p>
      </div>
    {/if}
  </div>
</div>
