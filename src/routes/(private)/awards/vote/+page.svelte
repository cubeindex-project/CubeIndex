<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  import type { AwardsEvent } from "$lib/components/dbTableTypes";

  let { data } = $props();
  const event: AwardsEvent = data.current_event ?? null;
  const categories = data.awards_category ?? [];

  const startTime = $derived.by(() =>
    event?.start_at ? new Date(event.start_at).getTime() : Number.NaN,
  );
  const endTime = $derived.by(() =>
    event?.end_at ? new Date(event.end_at).getTime() : Number.NaN,
  );

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
    if (!Number.isFinite(diffMs) || diffMs <= 0)
      return m.awards_vote_countdown_zero_short_text();
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [
      days > 0
        ? m.awards_vote_countdown_day_short_text({ count: days })
        : null,
      m.awards_vote_countdown_hour_short_text({ count: hours }),
      m.awards_vote_countdown_minute_short_text({ count: minutes }),
      m.awards_vote_countdown_second_short_text({ count: seconds }),
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

  const hasEvent = $derived(Boolean(event));
  const eventTitle = $derived.by(
    () => event?.title ?? m.awards_vote_event_title_default_text(),
  );
  const emptyDescriptionState = $derived.by(() => {
    if (eventPhase === "upcoming" && startDateLabel) return "upcoming";
    if (hasEvent) return "scheduled";
    return "none";
  });
</script>

<svelte:head>
  <title>{m.awards_vote_meta_title()}</title>
  <meta name="robots" content="noindex" />
</svelte:head>
  {#if eventPhase !== "live"}
    <div class="min-h-screen bg-base-100">
      <div class="mx-auto max-w-4xl space-y-8 px-4 py-16 text-center">
        <p class="text-xs uppercase tracking-[0.25em] text-base-content/60">
          {m.awards_vote_kicker_label()}
        </p>
        <div class="space-y-3">
          <h1 class="text-3xl font-clash font-bold md:text-4xl">
            {m.awards_vote_empty_title_text({ hasEvent })}
          </h1>
          <p class="text-base-content/70">
            {m.awards_vote_empty_description_text({
              state: emptyDescriptionState,
              eventTitle,
              startDateLabel,
            })}
          </p>
        </div>
        {#if eventPhase === "upcoming" && startCountdown && hasEvent}
          <div
            class="mx-auto flex max-w-sm flex-col items-center gap-2 rounded-2xl border border-base-200 bg-base-200/50 px-6 py-5 shadow-sm"
          >
            <span class="text-xs text-base-content/60">
              {m.awards_vote_countdown_start_label()}
            </span>
            <span class="text-2xl font-semibold">{startCountdown}</span>
            <span class="text-sm text-base-content/60">{startDateLabel}</span>
          </div>
        {:else if !hasEvent}
          <div
            class="mx-auto flex max-w-sm flex-col items-center gap-2 rounded-2xl border border-base-200 bg-base-200/50 px-6 py-5 shadow-sm"
          >
            <span class="text-xs text-base-content/60">
              {m.awards_vote_empty_status_label()}
            </span>
            <span class="text-2xl font-semibold">
              {m.awards_vote_empty_status_title_text()}
            </span>
            <span class="text-sm text-base-content/60">
              {m.awards_vote_empty_status_description_text()}
            </span>
          </div>
        {/if}
        <div class="flex flex-wrap justify-center gap-3">
          <a class="btn btn-primary" href="/awards">
            {m.awards_vote_empty_action_overview_cta()}
          </a>
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
                {m.awards_vote_kicker_label()}
              </p>
              <div class="space-y-1">
                <h1 class="text-3xl font-clash font-bold md:text-4xl">
                  {event.title}
                </h1>
                <p class="text-sm text-base-content/70 max-w-3xl">
                  {m.awards_vote_live_intro_text()}
                </p>
              </div>
            </div>
            <div
              class="rounded-2xl border border-base-300 bg-base-100 px-4 py-3 text-right shadow-sm"
            >
              <p class="text-xs text-base-content/60">
                {m.awards_vote_closing_label()}
              </p>
              <p class="text-lg font-semibold">{countdownLabel}</p>
            </div>
          </div>
        </header>

        <section class="space-y-4">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div class="space-y-1">
              <h2 class="text-xl font-semibold">
                {m.awards_vote_categories_title()}
              </h2>
              <p class="text-sm text-base-content/70">
                {m.awards_vote_categories_hint_text()}
              </p>
            </div>
            {#if categories.length > 0}
              <span
                class="badge badge-lg border-base-300 bg-base-100 shadow-sm"
              >
                {m.awards_vote_categories_open_badge_text({
                  count: categories.length,
                })}
              </span>
            {/if}
          </div>
          <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {#each categories as category (category.id)}
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
