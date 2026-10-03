<script lang="ts">
  import { resolve } from "$app/paths";
  import { onMount } from "svelte";
  import NumberFlow from "@number-flow/svelte";
  import type { Tables } from "$lib/types/database.types.js";
  import YoutubeVideoCard from "$lib/components/misc/YoutubeVideoCard.svelte";
  import { formatDate } from "$lib/utils/formatDate.js";
  import { millisecondsToTime } from "$lib/utils/time.js";
  import { getEventPhase } from "$lib/utils/eventPhase.js";

  const { data } = $props();
  const { currentEvent, previousEvents, logoDesigner } = $derived(data);

  let now = $state(new Date());

  function formatEventRange(event: Tables<"awards_event">) {
    const startDate = new Date(event.start_at);
    const endDate = new Date(event.end_at);

    if (
      !Number.isFinite(startDate.getTime()) ||
      !Number.isFinite(endDate.getTime())
    ) {
      return "";
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  const startAt = $derived(
    currentEvent?.start_at ? new Date(currentEvent.start_at) : null,
  );
  const endAt = $derived(
    currentEvent?.end_at ? new Date(currentEvent.end_at) : null,
  );

  const eventPhase = $derived(getEventPhase(currentEvent, now));

  const countdownTarget = $derived.by(() => {
    if (eventPhase === "upcoming") return startAt;
    if (eventPhase === "live") return endAt;
    return null;
  });

  const countdownLabel = $derived.by(() => {
    if (!countdownTarget) return "";
    return eventPhase === "upcoming" ? "Starts in" : "Ends in";
  });

  const countdownParts = $derived.by(() => {
    if (!countdownTarget) return null;
    const diff = countdownTarget.getTime() - now.getTime();
    return millisecondsToTime(diff);
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

  const hasEvent = $derived(Boolean(currentEvent));
  const eventDateRange = $derived.by(() =>
    currentEvent ? formatEventRange(currentEvent) : "",
  );
  const phaseLabel = $derived.by(() => {
    if (eventPhase === "upcoming") return "Nominations open soon";
    if (eventPhase === "live") return "Nominations are open";
    if (eventPhase === "past") return "Awards archive";
    return "CubeIndex Awards";
  });
  const heroHeadline = $derived.by(() => {
    if (eventPhase === "upcoming") {
      return `The ${currentEvent?.year ?? "next"} CubeIndex Awards are nearly here.`;
    }
    if (eventPhase === "live") {
      return `Celebrate the cubes that defined ${currentEvent?.year ?? "the season"}.`;
    }
    if (eventPhase === "past") {
      return `The ${currentEvent?.year ?? "latest"} CubeIndex Awards results are in.`;
    }
    return "Celebrating the cubes that define every season.";
  });
  const heroDescription = $derived.by(() => {
    if (eventPhase === "upcoming") {
      return "Get ready to recognize the most innovative, beloved, and collectible puzzles of the year.";
    }
    if (eventPhase === "live") {
      return "Nominate the puzzles you love and help the community celebrate this year’s standouts.";
    }
    if (eventPhase === "past") {
      return "Revisit the winners, finalists, and community favorites that made this season unforgettable.";
    }
    return "CubeIndex Awards honor the most innovative, beloved, and collectible puzzles in the cubing community.";
  });

  onMount(() => {
    const timer = setInterval(() => {
      now = new Date();
    }, 1000);
    return () => clearInterval(timer);
  });

  let showTrailer = $state(false);
</script>

<section
  class="relative flex min-h-screen items-center overflow-hidden px-6 py-20 sm:py-24"
>
  <video
    class="absolute inset-0 size-full object-cover"
    autoplay
    muted
    loop
    playsinline
    aria-hidden="true"
  >
    <source src="/videos/cubeindex-awards-background.mp4" type="video/mp4" />
  </video>
  <div class="absolute inset-0 bg-base-100/70 backdrop-blur-sm"></div>

  <div class="relative z-10 mx-auto max-w-7xl text-left">
    <div
      class="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:gap-16"
    >
      <div>
        <div class="flex flex-col items-start">
          <img
            src="/images/CubeIndex_Awards_Logo.webp"
            alt="CubeIndex Awards logo"
            class="h-28 w-auto rounded-2xl object-contain sm:h-32"
          />
          {#if logoDesigner}
            <p class="mt-3 text-xs italic text-base-content/60">
              Logo designed by <a
                href={resolve("/(public)/user/[username]", {
                  username: logoDesigner.username ?? "",
                })}
                class="link link-hover"
              >
                {logoDesigner.display_name}
              </a>.
            </p>
          {/if}
        </div>

        <div class="mt-8 space-y-6">
          <h1
            class="font-clash max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            {heroHeadline}
          </h1>
          <p class="max-w-2xl text-lg text-base-content/75 sm:text-xl">
            {heroDescription}
          </p>
        </div>

        <div class="mt-8 flex flex-wrap justify-start gap-3">
          {#if eventPhase === "live"}
            <a href={resolve("/awards/vote")} class="btn btn-primary btn-lg">
              <i class="fa-solid fa-cube"></i>
              Nominate a cube
            </a>
          {:else if eventPhase === "past" && currentEvent}
            <a
              href={resolve(`/awards/${currentEvent.year}`)}
              class="btn btn-primary btn-lg"
            >
              <i class="fa-solid fa-trophy"></i>
              View the results
            </a>
          {/if}
          <button
            class="btn btn-outline btn-lg"
            onclick={() => (showTrailer = true)}
          >
            <i class="fa-solid fa-play"></i>
            Watch the trailer
          </button>
        </div>
      </div>

      <div>
        {#if countdownSegments.length}
          <div class="aura aura-rainbow aura-sm w-full max-w-lg">
            <div
              class="rounded-2xl border border-base-200/80 bg-base-100 p-4 shadow-lg shadow-base-content/5 backdrop-blur sm:p-5"
            >
              <div class="flex flex-col items-start gap-1">
                <p
                  class={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] ${eventPhase === "live" ? "text-secondary" : "text-primary"}`}
                >
                  <i
                    class={`fa-regular ${eventPhase === "live" ? "fa-clock" : "fa-hourglass-half"}`}
                  ></i>
                  {countdownLabel}
                </p>
                {#if eventDateRange}
                  <p class="text-sm text-base-content/60">{eventDateRange}</p>
                {/if}
              </div>

              <div class="mt-4 grid grid-cols-4 gap-2">
                {#each countdownSegments as segment (segment.label)}
                  <div class="rounded-xl bg-base-200/70 px-2 py-3">
                    <NumberFlow
                      value={segment.value}
                      format={{ minimumIntegerDigits: 2 }}
                      class="text-2xl font-bold tabular-nums sm:text-3xl"
                    />
                    <span
                      class="mt-1 block text-[0.65rem] font-medium uppercase tracking-wide text-base-content/60"
                    >
                      {segment.label}
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {:else}
          <div
            class="w-full max-w-lg rounded-2xl border border-base-200/80 bg-base-100/75 p-5 backdrop-blur"
          >
            {#if !hasEvent}
              <div class="space-y-3">
                <div
                  class="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
                >
                  <i class="fa-solid fa-trophy"></i>
                </div>
                <h2 class="text-lg font-bold">
                  The next ceremony is being planned
                </h2>
                <p class="text-sm text-base-content/70">
                  Check back soon for the next CubeIndex Awards timeline and
                  your chance to celebrate the cubes you love.
                </p>
              </div>
            {:else}
              <div class="space-y-3">
                <p
                  class={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] ${eventPhase === "live" ? "text-secondary" : "text-primary"}`}
                >
                  <i class="fa-regular fa-circle-check"></i>
                  {phaseLabel}
                </p>
                {#if eventDateRange}
                  <p class="text-sm text-base-content/60">{eventDateRange}</p>
                {/if}
                <p class="text-sm text-base-content/70">
                  Explore this ceremony’s nominees, winners, and community
                  favorites.
                </p>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

{#if previousEvents.length > 0}
  <section class="relative overflow-hidden px-6 py-20 border-t-neutral">
    <div class="mx-auto max-w-6xl">
      <div class="text-center max-w-3xl mx-auto space-y-4">
        <p
          class="inline-flex items-center justify-center gap-2 rounded-full bg-base-100/70 px-4 py-1 text-sm ring-1 ring-base-200/70"
        >
          <i class="fa-solid fa-clock-rotate-left text-secondary"></i>
          Previous years
        </p>
        <h2
          class="font-clash text-3xl font-extrabold tracking-tight sm:text-4xl"
        >
          Explore past CubeIndex Awards
        </h2>
        <p class="text-base-content/70">
          Revisit winners, finalists, and standout community moments from
          earlier seasons.
        </p>
      </div>

      <div class="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {#each previousEvents as event (event.id)}
          <a
            class="group relative overflow-hidden rounded-2xl border border-base-200/70 bg-base-200/70 p-6 shadow-sm transition hover:border-primary/60 hover:shadow-lg"
            href={resolve(`/awards/${event.year}`)}
          >
            <div class="flex items-start justify-between gap-2">
              <div class="space-y-1 text-left">
                <h3 class="text-2xl font-bold">{event.year}</h3>
              </div>
            </div>
            <p class="mt-3 text-sm text-base-content/70">
              {formatEventRange(event)}
            </p>
          </a>
        {/each}
      </div>
    </div>
  </section>
{/if}

<YoutubeVideoCard
  bind:open={showTrailer}
  title="The CubeIndex Awards Trailer"
  videoURL="https://www.youtube.com/embed/XwcnE7LAbC8?si=1lLuqwX_9qi3O7HG"
/>
