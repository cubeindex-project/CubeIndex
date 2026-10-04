<script lang="ts">
  import { formatDate } from "$lib/utils/formatDate";
  import { plural } from "$lib/utils/plural";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  const { event, categories, nominees } = $derived(data);
</script>

<section class="relative isolate overflow-hidden min-h-screen">
  <div
    class="relative mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14 sm:py-16"
  >
    <header class="flex justify-between items-center gap-5 text-center">
      <h1 class="text-4xl font-clash font-extrabold leading-tight sm:text-5xl">
        {event.title}
      </h1>
      <div
        class="flex flex-wrap justify-center divide-x divide-base-300 overflow-hidden rounded-2xl bg-base-200"
      >
        <div class="px-5 py-3 text-left">
          <p class="text-xs uppercase tracking-[0.2em] text-base-content/60">
            <i class="fa-regular fa-calendar mr-1.5" aria-hidden="true"></i>
            Started
          </p>
          <p class="mt-1 text-sm font-semibold">
            {formatDate(event.start_at)}
          </p>
        </div>
        <div class="px-5 py-3 text-left">
          <p class="text-xs uppercase tracking-[0.2em] text-base-content/60">
            <i class="fa-solid fa-flag-checkered mr-1.5" aria-hidden="true"></i>
            Ended
          </p>
          <p class="mt-1 text-sm font-semibold">{formatDate(event.end_at)}</p>
        </div>
      </div>
    </header>

    <section class="space-y-4">
      {#if categories.length === 0}
        <div
          class="rounded-2xl border border-dashed border-base-300 bg-base-200/60 p-6 text-center"
        >
          <p class="text-base font-semibold">
            No categories found for this event.
          </p>
          <p class="text-sm text-base-content/70">
            Check back once categories are announced.
          </p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each categories as category (category.id)}
            {@const categoryNominees = nominees.filter(
              (nominee) => nominee.category_id === category.id,
            )}
            {@const orderedNominees = [...categoryNominees].sort(
              (a, b) => b.vote_count - a.vote_count,
            )}
            <div
              class="collapse collapse-arrow border border-base-300 bg-base-100 shadow-sm"
            >
              <input
                type="checkbox"
                aria-label={`Show nominees for ${category.name}`}
              />
              <div
                class="collapse-title flex items-center justify-between gap-4 pr-12"
              >
                <div class="space-y-1">
                  <h3 class="text-xl font-clash font-semibold">
                    {category.name}
                  </h3>
                  <p class="text-sm text-base-content/70">
                    {category.description}
                  </p>
                </div>
                <div class="flex gap-5">
                  <span class="badge badge-outline shrink-0">
                    {categoryNominees.length}
                    {plural(categoryNominees.length, "nominee")}
                  </span>
                  <span class="badge badge-outline shrink-0">
                    {category.total_votes}
                    {plural(category.total_votes, "total vote")}
                  </span>
                </div>
              </div>
              <div class="collapse-content">
                {#if orderedNominees.length === 0}
                  <p class="pt-2 text-sm text-base-content/70">
                    No nominees were found for this category.
                  </p>
                {:else}
                  <div class="flex gap-3 overflow-x-auto pt-2 pb-2">
                    {#each orderedNominees as nominee (nominee.cube.id)}
                      {@const isWinner = orderedNominees[0].id === nominee.id}
                      <article
                        class={`relative w-72 shrink-0 overflow-hidden rounded-xl border bg-base-200/50 ${
                          isWinner
                            ? "border-primary bg-primary/10"
                            : "border-base-300"
                        }`}
                      >
                        {#if nominee.cube.image_url}
                          <img
                            src={nominee.cube.image_url}
                            alt={nominee.cube.name ?? "Nominee cube"}
                            class="aspect-video w-full object-cover"
                            loading="lazy"
                          />
                        {/if}
                        <div class="space-y-2 p-4">
                          <div class="flex items-start justify-between gap-2">
                            <h4 class="font-semibold">{nominee.cube.name}</h4>
                            {#if isWinner}
                              <span
                                class="badge badge-primary badge-sm shrink-0"
                              >
                                <i class="fa-solid fa-trophy" aria-hidden="true"
                                ></i>
                                Winner
                              </span>
                            {/if}
                          </div>
                          <p class="text-sm font-medium text-primary">
                            {nominee.vote_count}
                            {plural(nominee.vote_count, "vote")}
                          </p>
                        </div>
                      </article>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>
  </div>
</section>
