<script lang="ts">
  import Chart from "chart.js/auto";
  import { onDestroy, onMount } from "svelte";
  import type { PageData } from "./$types";

  type StatsData = NonNullable<PageData["stats"]>;

  const EMPTY_STATS: StatsData = {
    totals: {
      totalQuantity: 0,
      uniqueModels: 0,
      ownedCount: 0,
      wishlistCount: 0,
      ratingsCount: 0,
      averageRating: null,
      achievementsCount: 0,
    },
    breakdowns: {
      byType: [] as { label: string; count: number }[],
      byCondition: [] as { label: string; count: number }[],
      byStatus: [] as { label: string; count: number }[],
    },
    charts: {
      collectionGrowth: [] as { month: string; total: number }[],
      ratingDistribution: [] as { rating: number; count: number }[],
    },
    recentActivity: [],
  };

  let { data }: { data: PageData } = $props();

  const profile = $derived(data.profile);
  const stats = $derived(data.stats ?? EMPTY_STATS);
  const totals = $derived(stats.totals ?? EMPTY_STATS.totals);

  const hasCollection = $derived(totals.totalQuantity > 0);
  const hasRatings = $derived(totals.ratingsCount > 0);
  const hasAchievements = $derived(totals.achievementsCount > 0);
  const hasAnyData = $derived(hasCollection || hasRatings || hasAchievements);

  const typeTotal = $derived(
    stats.breakdowns.byType.reduce((sum, entry) => sum + entry.count, 0)
  );
  const conditionTotal = $derived(
    stats.breakdowns.byCondition.reduce((sum, entry) => sum + entry.count, 0)
  );

  const typeBreakdown = $derived(
    stats.breakdowns.byType.map((entry) => ({
      ...entry,
      percentage: typeTotal > 0 ? Math.round((entry.count / typeTotal) * 100) : 0,
    }))
  );

  const conditionBreakdown = $derived(
    stats.breakdowns.byCondition.map((entry) => ({
      ...entry,
      percentage:
        conditionTotal > 0 ? Math.round((entry.count / conditionTotal) * 100) : 0,
    }))
  );

  const monthFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
  });

  function formatMonthLabel(month: string) {
    const [year, monthPart] = month.split("-");
    const parsed = new Date(Number(year), Number(monthPart) - 1, 1);
    if (Number.isNaN(parsed.getTime())) return month;
    return monthFormatter.format(parsed);
  }

  const growthLabels = $derived(
    stats.charts.collectionGrowth.map((point) => formatMonthLabel(point.month))
  );
  const growthValues = $derived(
    stats.charts.collectionGrowth.map((point) => point.total)
  );

  const ratingLabels = $derived(
    stats.charts.ratingDistribution.map((bucket) => bucket.rating.toFixed(1))
  );
  const ratingValues = $derived(
    stats.charts.ratingDistribution.map((bucket) => bucket.count)
  );

  const activityFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  let growthCanvas: HTMLCanvasElement;
  let ratingCanvas: HTMLCanvasElement;
  let growthChart: Chart | undefined;
  let ratingChart: Chart | undefined;

  onMount(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (growthCanvas && stats.charts.collectionGrowth.length > 0) {
      growthChart = new Chart(growthCanvas, {
        type: "line",
        data: {
          labels: growthLabels,
          datasets: [
            {
              label: "Total cubes",
              data: growthValues,
              borderColor: "#2563eb",
              backgroundColor: "rgba(37, 99, 235, 0.25)",
              borderWidth: 2,
              pointRadius: 3,
              tension: 0.25,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: prefersReducedMotion ? false : { duration: 300 },
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label(ctx) {
                  const value = ctx.parsed.y;
                  return value == null
                    ? "No data"
                    : `${ctx.dataset.label}: ${value.toLocaleString()}`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: "Cubes" },
            },
            x: {
              title: { display: true, text: "Month" },
            },
          },
        },
      });
    }

    if (ratingCanvas && stats.charts.ratingDistribution.length > 0) {
      ratingChart = new Chart(ratingCanvas, {
        type: "bar",
        data: {
          labels: ratingLabels,
          datasets: [
            {
              label: "Ratings",
              data: ratingValues,
              backgroundColor: "rgba(249, 115, 22, 0.7)",
              borderColor: "#ea580c",
              borderWidth: 1,
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: prefersReducedMotion ? false : { duration: 300 },
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: "Ratings submitted" },
            },
            x: {
              title: { display: true, text: "Rating" },
            },
          },
        },
      });
    }
  });

  onDestroy(() => {
    growthChart?.destroy();
    ratingChart?.destroy();
    growthChart = undefined;
    ratingChart = undefined;
  });

  const displayName = $derived(profile.display_name || profile.username);
  const metaTitle = $derived(`${displayName}'s Statistics - CubeIndex`);
  const metaDescription = $derived(
    hasAnyData
      ? `Explore ${displayName}'s CubeIndex statistics including collection size, ratings, and achievements.`
      : `${displayName} hasn't shared any collection data on CubeIndex yet.`
  );

  const activityIcons: Record<string, string> = {
    collection: "fa-solid fa-cube",
    rating: "fa-solid fa-star",
    achievement: "fa-solid fa-trophy",
  };
</script>

<svelte:head>
  <title>{metaTitle}</title>
  <meta name="description" content={metaDescription} />
</svelte:head>

<div class="space-y-10">
  <header class="space-y-2">
    <h1 class="text-3xl font-semibold">
      {displayName}'s collection statistics
    </h1>
    <p class="text-base-content/70">
      Track how {displayName} builds their cube collection, rates puzzles, and unlocks achievements over time.
    </p>
  </header>

  {#if !hasAnyData}
    <section
      class="rounded-2xl border border-dashed border-base-300 bg-base-200/60 p-6 text-center"
      aria-live="polite"
    >
      <i class="fa-solid fa-compass fa-2x mb-3 text-primary" aria-hidden="true"></i>
      <p class="text-lg font-medium">
        {displayName} hasn't added any cubes, ratings, or achievements yet.
      </p>
      <p class="mt-2 text-sm text-base-content/70">
        Once they start logging their collection, this dashboard will display growth trends, ratings, and milestones automatically.
      </p>
    </section>
  {/if}

  <section aria-labelledby="stats-summary" class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 id="stats-summary" class="text-xl font-semibold">Summary</h2>
      <span class="text-sm text-base-content/60">
        Updated in real time from CubeIndex activity
      </span>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-2xl border border-base-300 bg-base-200/70 p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-base-content/70">Collection size</h3>
          <i class="fa-solid fa-layer-group text-primary" aria-hidden="true"></i>
        </div>
        <p class="mt-3 text-3xl font-semibold">
          {totals.totalQuantity.toLocaleString()}
        </p>
        <p class="mt-1 text-sm text-base-content/70">
          {totals.uniqueModels.toLocaleString()} unique models
        </p>
      </article>

      <article class="rounded-2xl border border-base-300 bg-base-200/70 p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-base-content/70">Owned cubes</h3>
          <i class="fa-solid fa-cube text-primary" aria-hidden="true"></i>
        </div>
        <p class="mt-3 text-3xl font-semibold">
          {totals.ownedCount.toLocaleString()}
        </p>
        <p class="mt-1 text-sm text-base-content/70">
          {totals.wishlistCount.toLocaleString()} on wishlist
        </p>
      </article>

      <article class="rounded-2xl border border-base-300 bg-base-200/70 p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-base-content/70">Ratings submitted</h3>
          <i class="fa-solid fa-star text-primary" aria-hidden="true"></i>
        </div>
        <p class="mt-3 text-3xl font-semibold">
          {totals.ratingsCount.toLocaleString()}
        </p>
        <p class="mt-1 text-sm text-base-content/70">
          Average rating: {totals.averageRating != null ? totals.averageRating.toFixed(1) : "—"}
        </p>
      </article>

      <article class="rounded-2xl border border-base-300 bg-base-200/70 p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-base-content/70">Achievements</h3>
          <i class="fa-solid fa-trophy text-primary" aria-hidden="true"></i>
        </div>
        <p class="mt-3 text-3xl font-semibold">
          {totals.achievementsCount.toLocaleString()}
        </p>
        <p class="mt-1 text-sm text-base-content/70">
          Celebrate milestones unlocked on CubeIndex
        </p>
      </article>
    </div>
  </section>

  <section aria-labelledby="collection-breakdown" class="space-y-4">
    <h2 id="collection-breakdown" class="text-xl font-semibold">Collection breakdown</h2>
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <article class="rounded-2xl border border-base-300 bg-base-200/70 p-4 shadow-sm">
        <header class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold">By cube type</h3>
          <i class="fa-solid fa-shapes text-primary" aria-hidden="true"></i>
        </header>
        {#if typeBreakdown.length > 0}
          <ul class="space-y-3">
            {#each typeBreakdown as entry}
              <li>
                <div class="flex items-center justify-between text-sm font-medium">
                  <span class="truncate">{entry.label}</span>
                  <span>{entry.count.toLocaleString()}</span>
                </div>
                <div class="mt-2 h-2 rounded-full bg-base-300">
                  <div
                    class="h-2 rounded-full bg-primary"
                    style={`width: ${Math.min(entry.percentage, 100)}%`}
                    aria-hidden="true"
                  ></div>
                </div>
                <p class="mt-1 text-xs text-base-content/60">
                  {entry.percentage}% of collection
                </p>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="text-sm text-base-content/70">No cubes recorded yet.</p>
        {/if}
      </article>

      <article class="rounded-2xl border border-base-300 bg-base-200/70 p-4 shadow-sm">
        <header class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold">By condition</h3>
          <i class="fa-solid fa-toolbox text-primary" aria-hidden="true"></i>
        </header>
        {#if conditionBreakdown.length > 0}
          <ul class="space-y-3">
            {#each conditionBreakdown as entry}
              <li>
                <div class="flex items-center justify-between text-sm font-medium">
                  <span class="truncate">{entry.label}</span>
                  <span>{entry.count.toLocaleString()}</span>
                </div>
                <div class="mt-2 h-2 rounded-full bg-base-300">
                  <div
                    class="h-2 rounded-full bg-secondary"
                    style={`width: ${Math.min(entry.percentage, 100)}%`}
                    aria-hidden="true"
                  ></div>
                </div>
                <p class="mt-1 text-xs text-base-content/60">
                  {entry.percentage}% of collection
                </p>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="text-sm text-base-content/70">No cubes recorded yet.</p>
        {/if}
      </article>

      <article class="rounded-2xl border border-base-300 bg-base-200/70 p-4 shadow-sm">
        <header class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold">By status</h3>
          <i class="fa-solid fa-list-check text-primary" aria-hidden="true"></i>
        </header>
        {#if stats.breakdowns.byStatus.length > 0}
          <ul class="space-y-3">
            {#each stats.breakdowns.byStatus as entry}
              <li class="flex items-center justify-between text-sm font-medium">
                <span class="truncate">{entry.label}</span>
                <span>{entry.count.toLocaleString()}</span>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="text-sm text-base-content/70">No cubes recorded yet.</p>
        {/if}
      </article>
    </div>
  </section>

  <section aria-labelledby="charts" class="space-y-4">
    <h2 id="charts" class="text-xl font-semibold">Trends</h2>
    <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <article class="flex flex-col rounded-2xl border border-base-300 bg-base-200/70 p-4 shadow-sm">
        <header class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold">Collection growth</h3>
          <i class="fa-solid fa-chart-line text-primary" aria-hidden="true"></i>
        </header>
        {#if stats.charts.collectionGrowth.length > 0}
          <div class="min-h-[240px] flex-1">
            <canvas bind:this={growthCanvas} aria-label="Collection growth chart"></canvas>
          </div>
        {:else}
          <p class="text-sm text-base-content/70">
            Collection history will appear here once cubes are added with acquisition dates.
          </p>
        {/if}
      </article>

      <article class="flex flex-col rounded-2xl border border-base-300 bg-base-200/70 p-4 shadow-sm">
        <header class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold">Rating distribution</h3>
          <i class="fa-solid fa-chart-column text-primary" aria-hidden="true"></i>
        </header>
        {#if stats.charts.ratingDistribution.length > 0}
          <div class="min-h-[240px] flex-1">
            <canvas bind:this={ratingCanvas} aria-label="Rating distribution chart"></canvas>
          </div>
        {:else}
          <p class="text-sm text-base-content/70">
            Ratings submitted by {displayName} will populate this chart automatically.
          </p>
        {/if}
      </article>
    </div>
  </section>

  <section aria-labelledby="recent-activity" class="space-y-4">
    <h2 id="recent-activity" class="text-xl font-semibold">Recent activity</h2>
    {#if stats.recentActivity.length > 0}
      <ol class="space-y-3">
        {#each stats.recentActivity as item}
          <li class="rounded-2xl border border-base-300 bg-base-200/70 p-4 shadow-sm">
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <i class={item.icon ?? activityIcons[item.type]} aria-hidden="true"></i>
              </div>
              <div class="flex-1">
                <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p class="text-base font-semibold">{item.title}</p>
                  <time class="text-xs text-base-content/60" datetime={item.timestamp}>
                    {activityFormatter.format(new Date(item.timestamp))}
                  </time>
                </div>
                {#if item.subtitle}
                  <p class="text-sm text-base-content/70">{item.subtitle}</p>
                {/if}
              </div>
            </div>
          </li>
        {/each}
      </ol>
    {:else}
      <p class="text-sm text-base-content/70">
        When {displayName} adds cubes, submits ratings, or unlocks achievements, the latest updates will appear here.
      </p>
    {/if}
  </section>
</div>
