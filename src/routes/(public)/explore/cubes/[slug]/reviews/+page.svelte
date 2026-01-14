<script lang="ts">
  import StarRating from "$lib/components/rating/starRating.svelte";
  import Avatar from "$lib/components/user/avatar.svelte";
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte.js";
  import type { PageData } from "./$types";
  import { m } from "$lib/paraglide/messages";

  let { data }: { data: PageData } = $props();
  let { cube, reviews } = $derived(data);

  const MAX_SUMMARY_CHARS = 180;

  const pageTitle = $derived(
    m.explore_reviews_meta_title({ name: cube.name }),
  );

  const reviewCount = $derived(reviews.length);
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<section class="space-y-6">
  <header
    class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="space-y-1">
      <h2 class="text-lg font-semibold">
        {m.explore_reviews_heading_label()}
      </h2>
      {#if reviewCount > 0}
        <p class="text-sm opacity-70">
          {m.explore_reviews_count_text({ count: reviewCount })}
        </p>
      {:else}
        <p class="text-sm opacity-70">{m.explore_reviews_empty_text()}</p>
      {/if}
    </div>

    <a class="btn btn-primary btn-sm" href="/explore/cubes/{cube.slug}/review">
      <i class="fa-solid fa-pen-to-square mr-2"></i>
      {m.common_action_write_review_cta()}
    </a>
  </header>

  {#if reviewCount > 0}
    <div class="grid gap-4">
      {#each reviews as review (review.id)}
        {@const ratingsEntries = Object.entries(review.ratings).sort(
          ([a], [b]) => a.localeCompare(b),
        )}
        {@const raw = review.review.trim()}
        {@const summary =
          raw.length > MAX_SUMMARY_CHARS
            ? raw
                .slice(0, MAX_SUMMARY_CHARS)
                .replace(/\s+\S*$/, "")
                .trim() + "…"
            : raw}

        <article class="rounded-2xl border border-base-300 bg-base-200 p-5">
          <header
            class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
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
                  <span title={m.common_meta_last_update_label()}>
                    {formatDate(review.updated_at ?? review.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <a
                href="/explore/cubes/{cube.slug}/reviews/{review.id}"
                class="btn btn-sm btn-primary btn-outline"
                data-sveltekit-noscroll
                aria-label={m.explore_reviews_open_full_aria()}
              >
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                <span>{m.common_action_read_label()}</span>
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
                  href="/explore/cubes/{cube.slug}/reviews/{review.id}"
                  class="link link-primary text-sm"
                  data-sveltekit-noscroll
                >
                  {m.common_action_read_more_label()}
                </a>
              </div>
            {/if}
          </section>

          <section class="mt-5">
            <div
              class="mt-3 rounded-xl border border-base-300/70 bg-base-100/40 p-4"
            >
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {#each ratingsEntries as [label, rating] (label)}
                  <div
                    class="flex items-center justify-between gap-3 rounded-lg px-2 py-1 hover:bg-base-200/40"
                  >
                    <span class="text-sm opacity-80 truncate" title={label}>
                      {label}
                    </span>
                    <StarRating readOnly={true} {rating} />
                  </div>
                {/each}
              </div>
            </div>
          </section>
        </article>
      {/each}
    </div>
  {:else}
    <section
      aria-live="polite"
      class="rounded-xl border border-dashed border-base-300 p-8 text-center"
    >
      <i class="fa-solid fa-comment-dots text-3xl mb-3"></i>
      <p class="font-medium">{m.explore_reviews_empty_text()}</p>
      <p class="text-sm text-base-content/70">
        {m.explore_reviews_empty_hint_text()}
      </p>
    </section>
  {/if}
</section>
