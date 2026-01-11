<script lang="ts">
  import type { PageProps } from "./$types";
  import { m } from "$lib/paraglide/messages";

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
      label: m.awards_year_phase_upcoming_label(),
      tone: "primary",
      description: m.awards_year_phase_upcoming_description_text(),
    },
    live: {
      label: m.awards_year_phase_live_label(),
      tone: "secondary",
      description: m.awards_year_phase_live_description_text(),
    },
    past: {
      label: m.awards_year_phase_past_label(),
      tone: "accent",
      description: m.awards_year_phase_past_description_text(),
    },
    unknown: {
      label: m.awards_year_phase_unknown_label(),
      tone: "primary",
      description: m.awards_year_phase_unknown_description_text(),
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
  <title>
    {m.awards_year_meta_title({ eventTitle: event.title })}
  </title>
</svelte:head>
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
          {m.awards_year_title_h1()}
        </h1>
        <p class="max-w-2xl text-base-content/70">
          {phaseCopy[eventPhase].description}
        </p>
      </div>
      <div class="grid gap-3 grid-cols-2">
        <div
          class="rounded-2xl border border-base-200 bg-base-100 px-4 py-3 shadow-sm"
        >
          <p class="text-xs uppercase tracking-[0.25em] text-base-content/60">
            {m.awards_year_start_label()}
          </p>
          <p class="text-sm font-semibold">
            {formatDateTime(event.start_at)}
          </p>
        </div>
        <div
          class="rounded-2xl border border-base-200 bg-base-100 px-4 py-3 shadow-sm"
        >
          <p class="text-xs uppercase tracking-[0.25em] text-base-content/60">
            {m.awards_year_end_label()}
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
        {m.awards_year_results_locked_text({
          endDate: formatDateTime(event.end_at),
        })}
      </div>
    {/if}

    <section class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="space-y-1">
          <h2 class="text-2xl font-bold">
            {m.awards_year_categories_title()}
          </h2>
          <p class="text-sm text-base-content/70">
            {m.awards_year_categories_intro_text()}
          </p>
        </div>
        {#if categories.length > 0}
          <span class="badge badge-lg border-base-300 bg-base-100 shadow-sm">
            {m.awards_year_categories_badge_text({ count: categories.length })}
          </span>
        {/if}
      </div>

      {#if categories.length === 0}
        <div
          class="rounded-2xl border border-dashed border-base-300 bg-base-200/60 p-6 text-center"
        >
          <p class="text-base font-semibold">
            {m.awards_year_categories_empty_title_text()}
          </p>
          <p class="text-sm text-base-content/70">
            {m.awards_year_categories_empty_description_text()}
          </p>
        </div>
      {:else}
        <div class="grid gap-5 md:grid-cols-2">
          {#each categories as category (category.id)}
            {@const winner = winners.find((w) => w.category_id === category.id)}
            <article
              class="group flex h-full flex-col justify-between rounded-2xl border border-base-300 bg-base-200 p-5 shadow-sm"
            >
              <div class="space-y-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="space-y-1">
                    <p class="text-xl font-clash">
                      {category.name}
                    </p>
                    <p class="text-sm text-base-content/70">
                      {category.description}
                    </p>
                  </div>
                  <span
                    class="badge border-base-200 bg-base-200/70 text-xs text-nowrap"
                  >
                    {m.awards_year_nominees_badge_text({
                      count: winner?.nomineeCount ?? 0,
                    })}
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
                          {m.awards_year_winner_label()}
                        </div>

                      <div class="flex flex-col gap-3">
                        <a
                          class="group/thumbnail relative block h-28 w-full max-w-sm overflow-hidden rounded-xl border border-primary/30 bg-base-100 shadow-sm ring-1 ring-primary/20"
                          href="/explore/cubes/{winner.cube.slug}"
                        >
                          <img
                            data-hero-key={`cube-image-${winner.cube.id}`}
                            src={winner.cube.image_url}
                            alt={winner.cube.name}
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
                            {winner.cube.name}
                          </p>
                          <p
                            class="flex flex-wrap items-center gap-2 text-xs text-base-content/60"
                          >
                            <span
                              class="inline-flex h-6 items-center rounded-full border border-primary/20 bg-base-100 px-2 font-semibold text-primary"
                            >
                              {m.awards_year_votes_text({
                                count: winner.voteCount,
                              })}
                            </span>
                          </p>
                        </div>
                      </div>

                      <a
                        class="btn btn-sm btn-primary w-full sm:w-auto shadow-sm"
                        href={`/explore/cubes/${winner.cube.slug}`}
                        aria-label={m.awards_year_view_details_aria({
                          cubeName: winner.cube.name,
                        })}
                      >
                        {m.awards_year_view_details_cta()}
                      </a>
                    </div>
                  </div>
                {:else}
                  <div
                    class="rounded-xl border border-base-300 bg-base-300 p-4 text-sm text-base-content/70"
                  >
                    <i class="fa-regular fa-clock mr-2 text-primary"></i>
                    {m.awards_year_results_pending_text()}
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
