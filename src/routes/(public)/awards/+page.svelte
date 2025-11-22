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
  const event: AwardsEvent = data.current_event;
  const categories: AwardsCategory[] = data.awards_category;

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

  type EventPhase = "upcoming" | "live" | "past" | "none";

  const startAt = $derived.by(() =>
    event?.start_at ? new Date(event.start_at) : null,
  );
  const endAt = $derived.by(() => (event?.end_at ? new Date(event.end_at) : null));

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

  const partners: Partner[] = [
    {
      name: "SpeedLab Studios",
      emoji: "🎥",
      description:
        "Production partner powering the broadcast stage, gear labs, and backstage set tours.",
      link: { label: "Visit SpeedLab", url: "https://speedlab.example.com" },
    },
    {
      name: "CubeDepot",
      emoji: "🛒",
      description:
        "Retail partner providing prize kits, community giveaways, and sustainability spotlights.",
      link: { label: "Shop CubeDepot", url: "https://cubedepot.example.com" },
    },
  ];

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
      "inline-flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-base-200/80 bg-base-100/80 backdrop-blur px-5 py-3 shadow-sm w-fit mx-auto",
    countdownLabel: "inline-flex items-center gap-2 text-sm font-semibold",
    countdownList: "flex items-center gap-3 sm:gap-4",
    countdownPill:
      "flex flex-col items-center justify-center rounded-xl bg-base-200/60 px-3 py-2 min-w-[64px]",
    countdownValue: "font-mono text-2xl font-semibold tracking-tight",
    countdownUnit: "text-xs uppercase tracking-wide text-base-content/70",
    tileCard:
      "group relative overflow-hidden rounded-2xl border bg-base-200/70 backdrop-blur p-6 shadow-sm hover:shadow-lg transition",
    tileIcon:
      "inline-flex size-12 items-center justify-center rounded-2xl bg-base-300",
    partnerCard:
      "rounded-2xl border border-base-200/80 bg-base-100/70 backdrop-blur p-6 flex flex-col gap-3 shadow-sm",
  };

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
          {event.title}
        </span>
        <h1 class={ui.h1}>Celebrate the Cubes that Redefined the Season</h1>
        <p class={ui.lead}>
          The CubeIndex Awards honor the most innovative, beloved, and
          collectible puzzles of the year. Nominate your favorites, and vote
          with the community.
        </p>
        {#if mounted && countdownSegments.length}
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
        <div class={ui.ctas}>
          <a href="/awards/vote" class="btn btn-primary btn-lg sm:btn-xl">
            Nominate a Cube
          </a>
          <a href="#categories" class="btn btn-outline btn-lg sm:btn-xl">
            View Categories
          </a>
        </div>
      </div>
    </div>
  </section>

  <section id="categories" class={ui.section}>
    <div class={ui.container}>
      <div class="text-center max-w-3xl mx-auto space-y-4">
        <p class={`${ui.pill} justify-center ring-base-200/70 bg-base-100/70`}>
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
              <span class={ui.tileIcon}>
                <i class={`fa-solid ${category.icon}`}></i>
              </span>
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

  <section class={ui.section}>
    <div class={ui.container}>
      <div class="text-center max-w-3xl mx-auto space-y-4">
        <p class={`${ui.pill} justify-center ring-base-200/70 bg-base-100/70`}>
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
</SsgoiTransition>
