<script lang="ts">
  import { onMount } from "svelte";
  import NumberFlow from "@number-flow/svelte";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { page } from "$app/state";
  import type {
    AwardsCategory,
    AwardsEvent,
  } from "$lib/components/dbTableTypes.js";

  const { data } = $props();
  const event: AwardsEvent | null = data.current_event;
  const categories: AwardsCategory[] = data.awards_category ?? [];
  const previousEvents: AwardsEvent[] = data.previous_events ?? [];

  const formatDuration = (targetMs: number) => {
    if (!Number.isFinite(targetMs)) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const totalSeconds = Math.max(0, Math.floor(targetMs / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds };
  };

  let mounted = $state(false);
  let now = $state(new Date());

  const formatEventRange = (eventItem: AwardsEvent) => {
    const startDate = new Date(eventItem.start_at);
    const endDate = new Date(eventItem.end_at);

    if (
      !Number.isFinite(startDate.getTime()) ||
      !Number.isFinite(endDate.getTime())
    ) {
      return "";
    }

    const formatter = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    });

    return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
  };

  type PreviousEventSummary = {
    event: AwardsEvent;
    range: string;
  };

  const previousEventSummaries: PreviousEventSummary[] = previousEvents.map(
    (eventItem) => ({
      event: eventItem,
      range: formatEventRange(eventItem),
    })
  );

  type EventPhase = "upcoming" | "live" | "past" | "none";

  const startAt = $derived(event?.start_at ? new Date(event.start_at) : null);
  const endAt = $derived(event?.end_at ? new Date(event.end_at) : null);

  const eventStatus: EventPhase = $derived.by(() => {
    if (!startAt || !endAt) return "none";

    const startTime = startAt.getTime();
    const endTime = endAt.getTime();
    if (Number.isNaN(startTime) || Number.isNaN(endTime)) return "none";

    if (now.getTime() < startTime) return "upcoming";
    if (now.getTime() <= endTime) return "live";
    return "past";
  });

  const countdownTarget = $derived.by(() => {
    if (eventStatus === "upcoming") return startAt;
    if (eventStatus === "live") return endAt;
    return null;
  });

  const countdownLabel = $derived.by(() => {
    if (!countdownTarget) return "";
    return eventStatus === "upcoming" ? "Starts in" : "Ends in";
  });

  const countdownParts = $derived.by(() => {
    if (!countdownTarget) return null;
    const diff = countdownTarget.getTime() - now.getTime();
    return formatDuration(diff);
  });

  const countdownSegments = $derived.by(() => {
    if (!countdownParts) return [];
    return [
      { label: "Days", value: countdownParts.days },
      { label: "Hours", value: countdownParts.hours },
      { label: "Minutes", value: countdownParts.minutes },
      { label: "Seconds", value: countdownParts.seconds },
    ];
  });

  type Partner = {
    name: string;
    emoji: string;
    description: string;
    link: { label: string; url: string };
  };

  const partners: Partner[] = [];

  const ui = {
    section: "relative overflow-hidden py-20 px-6",
    container: "mx-auto max-w-6xl",
    hero: "bg-base-100",
    h1: "text-4xl sm:text-6xl font-clash font-extrabold leading-tight",
    h2: "text-3xl sm:text-4xl font-clash font-extrabold tracking-tight",
    lead: "text-lg sm:text-xl text-base-content/80",
    pill: "inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm ring-1",
    ctas: "flex flex-col sm:flex-row gap-4 justify-center",
    countdownCard:
      "inline-flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-base-200 bg-base-100 px-5 py-3 shadow-sm w-fit mx-auto",
    countdownLabel: "inline-flex items-center gap-2 text-sm font-semibold",
    countdownList:
      "grid grid-cols-2 justify-center gap-3 sm:flex sm:flex-nowrap sm:items-center sm:justify-center sm:gap-4",
    countdownPill:
      "flex flex-col items-center justify-center rounded-xl bg-base-200/60 px-3 py-2 min-w-[64px]",
    countdownValue: "font-mono text-2xl font-semibold tracking-tight",
    countdownUnit: "text-xs uppercase tracking-wide text-base-content/70",
    tileCard:
      "group relative overflow-hidden rounded-2xl border bg-base-200/70 p-6 shadow-sm hover:shadow-lg transition",
    partnerCard:
      "rounded-2xl border border-base-200/80 bg-base-100/70 p-6 flex flex-col gap-3 shadow-sm",
  };

  const hasEvent = $derived(Boolean(event));
  const heroTitle = $derived.by(() => event?.title ?? "CubeIndex Awards");

  onMount(() => {
    const timer = setInterval(() => {
      now = new Date();
    }, 1000);
    mounted = true;
    return () => clearInterval(timer);
  });
</script>

<svelte:head>
  <title>CubeIndex Awards</title>
</svelte:head>

<SsgoiTransition id={page.url.pathname}>
  <section class={`${ui.section} ${ui.hero}`}>
    <div aria-hidden="true" class="absolute inset-0">
      <div
        class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      ></div>
      <div
        class="absolute inset-0 bg-gradient-to-b from-base-200 via-base-100 to-base-100"
      ></div>
      <div
        class="absolute inset-0 opacity-30"
        style="background-image: radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(236, 72, 153, 0.2), transparent 35%), radial-gradient(circle at 80% 60%, rgba(59, 130, 246, 0.2), transparent 40%);"
      ></div>
    </div>

    <div class={`${ui.container} relative z-10 space-y-12 text-center`}>
      <div class="space-y-6 max-w-4xl mx-auto">
        <span class={`${ui.pill} ring-base-200/70 bg-base-100/70`}>
          <i class="fa-solid fa-award text-primary"></i>
          {heroTitle}
        </span>
        <h1 class={ui.h1}>Celebrate the Cubes that Redefined the Season</h1>
        <p class={ui.lead}>
          The CubeIndex Awards honor the most innovative, beloved, and
          collectible puzzles of the year. Nominate your favorites, and vote
          with the community.
        </p>
        {#if !hasEvent}
          <div class={ui.countdownCard}>
            <span class={`${ui.countdownLabel} text-base-content/70`}>
              <i class="fa-regular fa-circle-xmark"></i>
              No awards events are scheduled right now
            </span>
            <p class="text-sm text-base-content/70">
              Check back soon to see the next CubeIndex Awards timeline.
            </p>
          </div>
        {:else if countdownSegments.length}
          <div class={ui.countdownCard}>
            <span
              class={`${ui.countdownLabel} ${eventStatus === "live" ? "text-secondary" : "text-primary"}`}
            >
              <i
                class={`fa-regular ${eventStatus === "live" ? "fa-clock" : "fa-hourglass-half"}`}
              ></i>
              {countdownLabel}
            </span>
            <div class={ui.countdownList}>
              {#each countdownSegments as segment (segment.label)}
                <div class={ui.countdownPill}>
                  <NumberFlow
                    value={segment.value}
                    format={{ minimumIntegerDigits: 2 }}
                  />
                  <span class={ui.countdownUnit}>{segment.label}</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        {#if eventStatus === "live"}
          <div class={ui.ctas}>
            <a href="/awards/vote" class="btn btn-primary btn-lg sm:btn-xl">
              Nominate a Cube
            </a>
            <a href="#categories" class="btn btn-outline btn-lg sm:btn-xl">
              View Categories
            </a>
          </div>
        {/if}
      </div>
    </div>
  </section>

  {#if categories.length > 0}
    <section id="categories" class={ui.section}>
      <div class={ui.container}>
        <div class="text-center max-w-3xl mx-auto space-y-4">
          <p
            class={`${ui.pill} justify-center ring-base-200/70 bg-base-100/70`}
          >
            <i class="fa-solid fa-list-check text-secondary"></i>
            Categories
          </p>
          <h2 class={ui.h2}>Nominate Across {categories.length} Categories</h2>
          <p class="text-base-content/70">
            Each category balances performance data, community excitement, and
            storytelling. Explore the criteria before you submit your ballot.
          </p>
        </div>

        <div class="mt-12 grid gap-6 md:grid-cols-2">
          {#each categories as category (category.name)}
            <article class={`${ui.tileCard} border-base-200/70`}>
              <div class="flex items-center gap-3">
                <div class="text-left">
                  <h3 class="text-2xl font-bold">{category.name}</h3>
                </div>
              </div>
              <p class="mt-4 text-base-content/80">{category.description}</p>
            </article>
          {/each}
        </div>
      </div>
    </section>
  {/if}

  {#if previousEventSummaries.length > 0}
    <section class={ui.section}>
      <div class={ui.container}>
        <div class="text-center max-w-3xl mx-auto space-y-4">
          <p
            class={`${ui.pill} justify-center ring-base-200/70 bg-base-100/70`}
          >
            <i class="fa-solid fa-clock-rotate-left text-secondary"></i>
            Previous years
          </p>
          <h2 class={ui.h2}>Explore past CubeIndex Awards</h2>
          <p class="text-base-content/70">
            Revisit winners, finalists, and standout community moments from
            earlier seasons.
          </p>
        </div>

        <div class="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {#each previousEventSummaries as summary (summary.event.id)}
            <a
              class={`${ui.tileCard} border-base-200/70 hover:border-primary/60`}
              href={`/awards/${summary.event.year}`}
            >
              <div class="flex items-start justify-between gap-2">
                <div class="space-y-1 text-left">
                  <p
                    class="text-xs uppercase tracking-[0.25em] text-base-content/60"
                  >
                    {summary.event.title}
                  </p>
                  <h3 class="text-2xl font-bold">{summary.event.year}</h3>
                </div>
                <span class="badge badge-outline border-base-200 bg-base-100">
                  View
                </span>
              </div>
              {#if summary.range}
                <p class="mt-3 text-sm text-base-content/70">
                  {summary.range}
                </p>
              {/if}
            </a>
          {/each}
        </div>
      </div>
    </section>
  {/if}

  {#if partners.length > 0}
    <section class={ui.section}>
      <div class={ui.container}>
        <div class="text-center max-w-3xl mx-auto space-y-4">
          <p
            class={`${ui.pill} justify-center ring-base-200/70 bg-base-100/70`}
          >
            <i class="fa-solid fa-handshake text-primary"></i>
            Partners
          </p>
          <h2 class={ui.h2}>Partners</h2>
          <p class="text-base-content/70">
            <!-- To change -->
            These teams provide the cameras, stages, and prizes that make the CubeIndex
            Awards unforgettable.
          </p>
        </div>

        <div class="mt-12 grid gap-6 sm:grid-cols-2">
          {#each partners as partner (partner.name)}
            <article class={ui.partnerCard}>
              <div class="flex items-center gap-3">
                <span class="text-3xl" aria-hidden="true">{partner.emoji}</span>
                <h3 class="text-xl font-semibold">{partner.name}</h3>
              </div>
              <p class="text-base-content/70">{partner.description}</p>
              <a
                href={partner.link.url}
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-sm btn-outline w-fit">{partner.link.label}</a
              >
            </article>
          {/each}
        </div>
      </div>
    </section>
  {/if}
</SsgoiTransition>
