<script lang="ts">
  import { SsgoiTransition } from "@ssgoi/svelte";
  import type {
    AwardsEvent,
    AwardsCategory,
  } from "$lib/components/dbTableTypes";

  let { data } = $props();
  const event: AwardsEvent = data.current_event;
  const categories: AwardsCategory[] = data.awards_category;

  const startTime = new Date(event.start_at).getTime();
  const endTime = new Date(event.end_at).getTime();

  type EventPhase = "unknown" | "upcoming" | "live" | "past";

  let nowMs = $state(Date.now());
  $effect(() => {
    const id = setInterval(() => {
      nowMs = Date.now();
    }, 1000);
    return () => clearInterval(id);
  });

  const eventPhase: EventPhase = $derived.by(() => {
    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
      return "unknown";
    }
    if (nowMs < startTime) return "upcoming";
    if (nowMs <= endTime) return "live";
    return "past";
  });

  const formatCountdown = (targetMs: number) => {
    const diffMs = targetMs - nowMs;
    if (!Number.isFinite(diffMs) || diffMs <= 0) return "0s";
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [
      days > 0 ? `${days}d` : null,
      `${hours}h`,
      `${minutes}m`,
      `${seconds}s`,
    ].filter(Boolean);
    return parts.join(" ");
  };

  const countdownLabel = $derived.by(() => formatCountdown(endTime));
  const startCountdown = $derived.by(() => formatCountdown(startTime));

  const startDateLabel = $derived.by(() => {
    if (!Number.isFinite(startTime)) return "";
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(startTime));
  });
</script>

<svelte:head>
  <title>Awards Voting - CubeIndex</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<SsgoiTransition id="awards-vote">
  {#if eventPhase !== "live"}
    <div class="min-h-screen bg-base-100">
      <div class="mx-auto max-w-4xl space-y-8 px-4 py-16 text-center">
        <p class="text-xs uppercase tracking-[0.25em] text-base-content/60">
          Awards voting
        </p>
        <div class="space-y-3">
          <h1 class="text-3xl font-clash font-bold md:text-4xl">
            No awards event is live right now
          </h1>
          <p class="text-base-content/70">
            {#if eventPhase === "upcoming" && startDateLabel}
              Voting opens for {event.title} on {startDateLabel}. Check back
              once the event begins.
            {:else}
              Check back soon for the next CubeIndex Awards event.
            {/if}
          </p>
        </div>
        {#if eventPhase === "upcoming" && startCountdown}
          <div
            class="mx-auto flex max-w-sm flex-col items-center gap-2 rounded-2xl border border-base-200 bg-base-200/50 px-6 py-5 shadow-sm"
          >
            <span class="text-xs text-base-content/60">Starts in</span>
            <span class="text-2xl font-semibold">{startCountdown}</span>
            <span class="text-sm text-base-content/60">{startDateLabel}</span>
          </div>
        {/if}
        <div class="flex flex-wrap justify-center gap-3">
          <a class="btn btn-primary" href="/awards">Awards overview</a>
        </div>
      </div>
    </div>
  {:else}
    <div class="min-h-screen bg-base-100">
      <div class="mx-auto max-w-6xl space-y-10 px-4 py-12">
        <header
          class="rounded-3xl border border-base-200 bg-base-200/50 p-6 shadow-sm"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="space-y-3">
              <p
                class="text-xs uppercase tracking-[0.25em] text-base-content/60"
              >
                Awards voting
              </p>
              <div class="space-y-1">
                <h1 class="text-3xl font-clash font-bold md:text-4xl">
                  {event.title}
                </h1>
                <p class="text-sm text-base-content/70 max-w-3xl">
                  Review each category and jump into the ballot to cast your
                  picks.
                </p>
              </div>
            </div>
            <div
              class="rounded-2xl border border-base-300 bg-base-100 px-4 py-3 text-right shadow-sm"
            >
              <p class="text-xs text-base-content/60">Voting closes in</p>
              <p class="text-lg font-semibold">{countdownLabel}</p>
            </div>
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
            {#if categories.length > 0}
              <span
                class="badge badge-lg border-base-300 bg-base-100 shadow-sm"
              >
                {categories.length} open
              </span>
            {/if}
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            {#each categories as category}
              <a
                class="group rounded-2xl border border-base-200 bg-base-200 p-5 transition hover:border-primary/50 focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/40"
                href="/awards/vote/{category.slug}"
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
  {/if}
</SsgoiTransition>
