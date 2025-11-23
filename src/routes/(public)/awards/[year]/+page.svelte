<script lang="ts">
  import { page } from "$app/state";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import type { PageProps } from "./$types";

  type EventPhase = "upcoming" | "live" | "past" | "unknown";

  const { data }: PageProps = $props();
  const event = data.event;
  const eventPhase = data.eventPhase;
  const categories = data.categories;
  const winners = data.winners;

  const phaseCopy: Record<
    EventPhase,
    {
      label: string;
      tone: "primary" | "secondary" | "accent";
      description: string;
    }
  > = {
    upcoming: {
      label: "Upcoming",
      tone: "primary",
      description: "Results unlock once voting closes.",
    },
    live: {
      label: "Voting in progress",
      tone: "secondary",
      description: "Votes are still coming in. Check back after the finale.",
    },
    past: {
      label: "Completed",
      tone: "accent",
      description: "Explore winners and finalist highlights below.",
    },
    unknown: {
      label: "Status unavailable",
      tone: "primary",
      description: "Event timing could not be determined.",
    },
  };

  const formatDateTime = (value: string | Date) =>
    new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

  const resultLocked = eventPhase !== "past";
</script>

<svelte:head>
  <title>{event.title} Results - CubeIndex Awards</title>
</svelte:head>

<SsgoiTransition id={page.url.pathname}>
  <section class="relative isolate overflow-hidden bg-base-100">
    <div aria-hidden="true" class="absolute inset-0">
      <div
        class="absolute inset-0 bg-gradient-to-br from-base-200 via-base-100 to-base-100"
      ></div>
      <div
        class="absolute inset-0 opacity-25"
        style="background-image: radial-gradient(circle at 15% 20%, rgba(99, 102, 241, 0.18), transparent 40%), radial-gradient(circle at 80% 10%, rgba(244, 114, 182, 0.12), transparent 35%), radial-gradient(circle at 70% 70%, rgba(56, 189, 248, 0.12), transparent 35%);"
      ></div>
    </div>

    <div
      class="relative mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14 sm:py-16"
    >
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-4">
          <div
            class="inline-flex items-center gap-2 rounded-full border border-base-200 bg-base-100 px-4 py-1 text-sm shadow-sm"
          >
            <i class="fa-solid fa-award text-primary"></i>
            <span>{event.title}</span>
          </div>
          <h1
            class="text-4xl font-clash font-extrabold leading-tight sm:text-5xl"
          >
            Event Results
          </h1>
          <p class="max-w-2xl text-base-content/70">
            {phaseCopy[eventPhase].description}
          </p>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            class="rounded-2xl border border-base-200 bg-base-100 px-4 py-3 shadow-sm"
          >
            <p class="text-xs uppercase tracking-[0.25em] text-base-content/60">
              Event started
            </p>
            <p class="text-sm font-semibold">
              {formatDateTime(event.start_at)}
            </p>
          </div>
          <div
            class="rounded-2xl border border-base-200 bg-base-100 px-4 py-3 shadow-sm"
          >
            <p class="text-xs uppercase tracking-[0.25em] text-base-content/60">
              Event ended
            </p>
            <p class="text-sm font-semibold">{formatDateTime(event.end_at)}</p>
          </div>
        </div>
      </div>

      {#if resultLocked}
        <div
          class="rounded-2xl border border-dashed border-base-300 bg-base-200/60 px-5 py-4 text-sm text-base-content/80"
        >
          <i class="fa-regular fa-hourglass-half mr-2 text-primary"></i>
          Results will appear once the event concludes. Check back after {formatDateTime(
            event.end_at
          )}.
        </div>
      {/if}

      <section class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <h2 class="text-2xl font-bold">Categories</h2>
            <p class="text-sm text-base-content/70">
              Explore each category to see finalists and winners.
            </p>
          </div>
          {#if categories.length > 0}
            <span class="badge badge-lg border-base-300 bg-base-100 shadow-sm">
              {categories.length} categories
            </span>
          {/if}
        </div>

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
          <div class="grid gap-5 md:grid-cols-2">
            {#each categories as category}
              {@const winner = winners.find(
                (w) => w.category_id === category.id
              )}
              <article
                class="group flex h-full flex-col justify-between rounded-2xl border border-base-300 bg-base-200 p-5 shadow-sm"
              >
                <div class="space-y-3">
                  <div class="flex items-start justify-between gap-2">
                    <div class="space-y-1">
                      <p
                        class="text-xl font-clash"
                      >
                        {category.name}
                      </p>
                      <p class="text-sm text-base-content/70">
                        {category.description}
                      </p>
                    </div>
                    <span class="badge border-base-200 bg-base-200/70 text-xs text-nowrap">
                      {category.nominees_count} nominees
                    </span>
                  </div>

                  {#if eventPhase === "past" && winner}
                    <div
                      class="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-base-100 p-5 shadow-md"
                    >
                      <div class="flex flex-col gap-4">
                        <div
                          class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
                        >
                          <i class="fa-solid fa-crown text-sm"></i>
                          Winner
                        </div>

                        <div class="flex flex-col gap-3">
                          <a
                            class="group/thumbnail relative block h-28 w-full max-w-sm overflow-hidden rounded-xl border border-primary/30 bg-base-100 shadow-sm ring-1 ring-primary/20"
                            href="/explore/cubes/{winner.slug}"
                          >
                            <img
                              data-hero-key={`cube-image-${winner.id}`}
                              src={winner.image_url}
                              alt={winner.name}
                              class="h-full w-full object-cover transition duration-300 group-hover/thumbnail:scale-[1.03]"
                              loading="eager"
                              fetchpriority="high"
                            />
                            <span
                              class="absolute inset-0 bg-gradient-to-t from-base-100/40 via-transparent to-transparent opacity-0 transition duration-300 group-hover/thumbnail:opacity-100"
                            ></span>
                          </a>

                          <div class="space-y-1">
                            <p class="text-lg font-semibold leading-tight">
                              {winner.name}
                            </p>
                            <p
                              class="flex flex-wrap items-center gap-2 text-xs text-base-content/60"
                            >
                              <span
                                class="inline-flex h-6 items-center rounded-full border border-primary/20 bg-base-100 px-2 font-semibold text-primary"
                              >
                                {winner.votes} vote{winner.votes === 1
                                  ? ""
                                  : "s"}
                              </span>
                            </p>
                          </div>
                        </div>

                        <a
                          class="btn btn-sm btn-primary w-full sm:w-auto shadow-sm"
                          href={`/explore/cubes/${winner.slug}`}
                          aria-label={`View details for ${winner.name}`}
                        >
                          View details
                        </a>
                      </div>
                    </div>
                  {:else}
                    <div
                      class="rounded-xl border border-base-300 bg-base-300 p-4 text-sm text-base-content/70"
                    >
                      <i class="fa-regular fa-clock mr-2 text-primary"></i>
                      Results available after the event ends.
                    </div>
                  {/if}
                </div>
              </article>
            {/each}
          </div>
        {/if}
      </section>
    </div>
  </section>
</SsgoiTransition>
