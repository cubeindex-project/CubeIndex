<script lang="ts">
  import { resolve } from "$app/paths";
  import AwardsCountdown from "$lib/components/misc/AwardsCountdown.svelte";
  import { getEventPhase } from "$lib/utils/eventPhase.js";

  let { data } = $props();
  const { currentEvent, eventCategories } = $derived(data);

  const eventPhase = $derived(getEventPhase(currentEvent));
</script>

<div class="min-h-screen bg-base-100">
  <div class="mx-auto max-w-6xl space-y-10 px-4 py-12">
    <header
      class="rounded-3xl border border-base-200 bg-base-200/50 p-6 shadow-sm"
    >
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="space-y-3">
          <div class="space-y-1">
            <h1 class="text-3xl font-clash font-bold md:text-4xl">
              {currentEvent.title}
            </h1>
            <p class="text-sm text-base-content/70 max-w-3xl">
              Review each category and jump into the ballot to cast your picks.
            </p>
          </div>
        </div>
        <AwardsCountdown
          event={currentEvent}
          {eventPhase}
          countdownLabel="Voting closes in"
        />
      </div>
    </header>

    <section class="space-y-4">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="space-y-1">
          <h2 class="text-xl font-semibold">Categories</h2>
          <p class="text-sm text-base-content/70">
            Choose a category to view nominees and submit your vote.
          </p>
        </div>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {#each eventCategories as category (category.id)}
          <a
            class="group rounded-2xl border p-5 transition focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/40 {category.alreadyVoted
              ? 'border-success bg-success/10 hover:border-success'
              : 'border-base-200 bg-base-200 hover:border-primary/50'}"
            href={resolve("/(private)/awards/vote/[category]", {
              category: category.slug,
            })}
          >
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-2">
                <h3 class="text-lg font-semibold">{category.name}</h3>
                <p class="text-sm text-base-content/80">
                  {category.description}
                </p>
              </div>
              {#if category.alreadyVoted}
                <span class="badge badge-success shrink-0 gap-1">
                  <i class="fa-solid fa-check" aria-hidden="true"></i>
                  Voted
                </span>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    </section>
  </div>
</div>
