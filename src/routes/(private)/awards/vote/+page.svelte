<script lang="ts">
  import { resolve } from "$app/paths";
  import AwardsCountdown from "$lib/components/misc/AwardsCountdown.svelte";
  import { getEventPhase } from "$lib/utils/eventPhase.js";
  import { formatDate } from "$lib/utils/formatDate.js";

  let { data } = $props();
  const { currentEvent, eventCategories } = $derived(data);

  const eventPhase = $derived(getEventPhase(currentEvent));
  const eventTitle = $derived(currentEvent?.title ?? "CubeIndex Awards");
  const startDateLabel = $derived(
    currentEvent ? formatDate(currentEvent.start_at) : null,
  );
</script>

{#if eventPhase === "live" && currentEvent}
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
                Review each category and jump into the ballot to cast your
                picks.
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
              class="group rounded-2xl border border-base-200 bg-base-200 p-5 transition hover:border-primary/50 focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/40"
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
              </div>
            </a>
          {/each}
        </div>
      </section>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-base-100">
    <div class="mx-auto max-w-4xl space-y-8 px-4 py-16 text-center">
      <p class="text-xs uppercase tracking-[0.25em] text-base-content/60">
        Awards voting
      </p>
      <div class="space-y-3">
        <h1 class="text-3xl font-clash font-bold md:text-4xl">
          {#if eventPhase === "upcoming"}
            No awards event is live right now
          {:else}
            No awards events are scheduled
          {/if}
        </h1>
        <p class="text-base-content/70">
          {#if eventPhase === "upcoming" && startDateLabel}
            Voting opens for {eventTitle} on {startDateLabel}. Check back once
            the event begins.
          {:else}
            We haven't scheduled the next CubeIndex Awards yet. Stay tuned.
          {/if}
        </p>
      </div>
      {#if eventPhase === "upcoming" && currentEvent}
        <AwardsCountdown
          event={currentEvent}
          {eventPhase}
          countdownLabel="Starts in"
          variant="featured"
        />
      {:else}
        <div
          class="mx-auto flex max-w-sm flex-col items-center gap-2 rounded-2xl border border-base-200 bg-base-200/50 px-6 py-5 shadow-sm"
        >
          <span class="text-xs text-base-content/60">Status</span>
          <span class="text-2xl font-semibold">No events planned</span>
          <span class="text-sm text-base-content/60">
            We’ll announce the next awards timeline soon.
          </span>
        </div>
      {/if}
      <div class="flex flex-wrap justify-center gap-3">
        <a class="btn btn-primary" href={resolve("/awards")}>Awards overview</a>
      </div>
    </div>
  </div>
{/if}
