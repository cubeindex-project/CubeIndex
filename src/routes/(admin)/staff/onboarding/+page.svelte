<script lang="ts">
  import Chart from "chart.js/auto";
  import { onDestroy, onMount } from "svelte";
  import type { PageData } from "./$types";

  type ChannelKey = "friend" | "discord" | "reddit" | "youtube" | "search" | "other";
  type FeatureKey =
    | "price_tracking"
    | "collection_management"
    | "ratings_reviews"
    | "shop_compare"
    | "alerts_discord"
    | "achievements";

  const channelLabelMap: Record<ChannelKey, string> = {
    friend: "Friend",
    discord: "Discord",
    reddit: "Reddit",
    youtube: "YouTube",
    search: "Search Engine",
    other: "Other",
  };

  const featureLabelMap: Record<FeatureKey, string> = {
    price_tracking: "Price tracking",
    collection_management: "Collection management",
    ratings_reviews: "Ratings & reviews",
    shop_compare: "Shop compare",
    alerts_discord: "Discord alerts",
    achievements: "Achievements",
  };

  interface ProfileSummary {
    user_id: string;
    username: string | null;
    display_name: string | null;
    created_at: string | null;
    onboarded: boolean | null;
    role: string | null;
  }

  interface OnboardingRow {
    id: number;
    user_id: string;
    discovered_via: ChannelKey;
    interested_features: unknown;
    other_text: string | null;
  }

  interface EnrichedResponse extends OnboardingRow {
    interested_features: FeatureKey[];
    other_text: string | null;
    profile: ProfileSummary | null;
  }

  const { data }: { data: PageData } = $props();
  const rawResponses = Array.isArray(data.responses)
    ? (data.responses as OnboardingRow[])
    : [];
  const profiles = Array.isArray(data.profiles)
    ? (data.profiles as ProfileSummary[])
    : [];

  const profileMap = new Map(profiles.map((profile) => [profile.user_id, profile]));

  function parseFeatures(value: unknown): FeatureKey[] {
    if (Array.isArray(value)) {
      return value.filter(
        (item): item is FeatureKey =>
          typeof item === "string" && (item as string) in featureLabelMap
      );
    }

    if (typeof value === "string" && value.trim().length > 0) {
      try {
        const parsed = JSON.parse(value) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item): item is FeatureKey =>
              typeof item === "string" && (item as string) in featureLabelMap
          );
        }
      } catch {
        return [];
      }
    }

    if (value && typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>);
      return entries
        .filter(([, flag]) => Boolean(flag))
        .map(([key]) => key)
        .filter((key): key is FeatureKey => key in featureLabelMap);
    }

    return [];
  }

  function sanitizeText(input: unknown): string | null {
    if (typeof input !== "string") return null;
    const trimmed = input.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  const responses: EnrichedResponse[] = rawResponses
    .map((entry) => ({
      ...entry,
      interested_features: parseFeatures(entry.interested_features),
      other_text: sanitizeText(entry.other_text),
      profile: profileMap.get(entry.user_id) ?? null,
    }))
    .sort((a, b) => b.id - a.id);

  const totalResponses = responses.length;
  const totalCompleted = responses.filter((entry) => entry.profile?.onboarded).length;
  const sumFeatureSelections = responses.reduce(
    (sum, entry) => sum + entry.interested_features.length,
    0
  );
  const averageFeatures = totalResponses > 0 ? sumFeatureSelections / totalResponses : 0;
  const engagedUsers = responses.filter((entry) => entry.interested_features.length >= 3).length;

  const channelStats = (Object.entries(channelLabelMap) as [ChannelKey, string][]) 
    .map(([key, label]) => ({
      key,
      label,
      count: responses.filter((entry) => entry.discovered_via === key).length,
    }))
    .filter((entry) => entry.count > 0)
    .map((entry) => ({
      ...entry,
      percentage:
        totalResponses > 0
          ? Math.round((entry.count / totalResponses) * 100)
          : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const topChannel = channelStats[0] ?? null;

  const featureStats = (Object.entries(featureLabelMap) as [FeatureKey, string][]) 
    .map(([key, label]) => ({
      key,
      label,
      count: responses.reduce(
        (sum, entry) => sum + (entry.interested_features.includes(key) ? 1 : 0),
        0
      ),
    }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count);

  const totalFeatureSelections = featureStats.reduce(
    (sum, entry) => sum + entry.count,
    0
  );

  const featureStatsWithPercent = featureStats.map((entry) => ({
    ...entry,
    percentage:
      totalFeatureSelections > 0
        ? Math.round((entry.count / totalFeatureSelections) * 100)
        : 0,
  }));

  const topFeature = featureStatsWithPercent[0] ?? null;

  const chartPalette = [
    "#2563eb",
    "#9333ea",
    "#0ea5e9",
    "#22c55e",
    "#f97316",
    "#facc15",
  ];

  const channelChartLabels = channelStats.map((entry) => entry.label);
  const channelChartValues = channelStats.map((entry) => entry.count);

  const featureChartLabels = featureStatsWithPercent.map((entry) => entry.label);
  const featureChartValues = featureStatsWithPercent.map((entry) => entry.count);

  const latestResponses = responses.slice(0, 8);
  const feedbackNotes = responses.filter((entry) => entry.other_text).slice(0, 6);

  const signupFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  });

  function formatSignupDate(input: string | null | undefined): string {
    if (!input) return "—";
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) return "—";
    return signupFormatter.format(parsed);
  }

  let channelCanvas: HTMLCanvasElement | null = null;
  let featureCanvas: HTMLCanvasElement | null = null;
  let channelChart: Chart | null = null;
  let featureChart: Chart | null = null;

  onMount(() => {
    if (channelCanvas && channelChartLabels.length > 0) {
      channelChart = new Chart(channelCanvas, {
        type: "doughnut",
        data: {
          labels: channelChartLabels,
          datasets: [
            {
              data: channelChartValues,
              backgroundColor: chartPalette,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom" },
            tooltip: {
              callbacks: {
                label(context) {
                  const value = context.parsed as number;
                  const label = context.label ?? "";
                  return `${label}: ${value}`;
                },
              },
            },
          },
        },
      });
    }

    if (featureCanvas && featureChartLabels.length > 0) {
      featureChart = new Chart(featureCanvas, {
        type: "bar",
        data: {
          labels: featureChartLabels,
          datasets: [
            {
              data: featureChartValues,
              backgroundColor: chartPalette,
            },
          ],
        },
        options: {
          responsive: true,
          indexAxis: "y",
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: { precision: 0 },
              beginAtZero: true,
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label(context) {
                  const value = context.parsed.x as number;
                  const label = context.label ?? "";
                  return `${label}: ${value}`;
                },
              },
            },
          },
        },
      });
    }
  });

  onDestroy(() => {
    channelChart?.destroy();
    featureChart?.destroy();
  });

  function featureLabelList(list: FeatureKey[]): string {
    if (list.length === 0) return "No selections";
    return list.map((key) => featureLabelMap[key]).join(", ");
  }
</script>

<section class="min-h-screen px-4 py-10 lg:px-8">
  <div class="max-w-6xl mx-auto space-y-8">
    <header class="space-y-2 text-center md:text-left">
      <p class="text-sm uppercase tracking-wide text-primary font-semibold">
        Staff Insights
      </p>
      <h1 class="text-4xl font-black font-clash text-base-content">
        User Onboarding Overview
      </h1>
      <p class="text-base text-base-content/70 max-w-3xl">
        Track how newcomers discover CubeIndex, what excites them most, and review
        qualitative notes to fine-tune the onboarding experience.
      </p>
    </header>

    {#if totalResponses === 0}
      <div class="alert alert-info">
        <i class="fa-solid fa-person-circle-question" aria-hidden="true"></i>
        <span>No onboarding surveys have been completed yet.</span>
      </div>
    {:else}
      <div class="stats stats-vertical lg:stats-horizontal shadow w-full">
        <div class="stat">
          <div class="stat-title">Total responses</div>
          <div class="stat-value text-primary">{totalResponses}</div>
          <div class="stat-desc">
            {totalCompleted} marked as fully onboarded
          </div>
        </div>
        <div class="stat">
          <div class="stat-title">Avg. features selected</div>
          <div class="stat-value">{averageFeatures.toFixed(1)}</div>
          <div class="stat-desc">
            {sumFeatureSelections} total feature selections
          </div>
        </div>
        <div class="stat">
          <div class="stat-title">Highly engaged newcomers</div>
          <div class="stat-value text-success">{engagedUsers}</div>
          <div class="stat-desc">3+ features picked</div>
        </div>
        <div class="stat">
          <div class="stat-title">Top discovery</div>
          <div class="stat-value text-secondary">
            {topChannel ? topChannel.label : "—"}
          </div>
          <div class="stat-desc">
            {topChannel ? `${topChannel.percentage}% of responses` : "No data"}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div class="card bg-base-100 shadow-xl border border-base-300">
          <div class="card-body space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="card-title">Discovery channels</h2>
                <p class="text-sm text-base-content/70">
                  Understand where users first hear about CubeIndex.
                </p>
              </div>
              {#if topChannel}
                <div class="text-right">
                  <p class="text-sm font-semibold">{topChannel.label}</p>
                  <p class="text-xs text-base-content/60">
                    {topChannel.count} responses • {topChannel.percentage}%
                  </p>
                </div>
              {/if}
            </div>
            <div class="h-72">
              {#if channelChartLabels.length > 0}
                <canvas
                  bind:this={channelCanvas}
                  aria-label="Discovery channel distribution chart"
                ></canvas>
              {:else}
                <div class="h-full flex items-center justify-center text-sm text-base-content/60">
                  No discovery data yet.
                </div>
              {/if}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {#each channelStats as channel}
                <div class="flex items-center justify-between p-3 bg-base-200 rounded-xl">
                  <span class="font-medium">{channel.label}</span>
                  <span class="text-base-content/70">{channel.count} • {channel.percentage}%</span>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl border border-base-300">
          <div class="card-body space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="card-title">Feature interest</h2>
                <p class="text-sm text-base-content/70">
                  See which areas of CubeIndex generate the most excitement.
                </p>
              </div>
              {#if topFeature}
                <div class="text-right">
                  <p class="text-sm font-semibold">{topFeature.label}</p>
                  <p class="text-xs text-base-content/60">
                    {topFeature.count} mentions • {topFeature.percentage}% of picks
                  </p>
                </div>
              {/if}
            </div>
            <div class="h-72">
              {#if featureChartLabels.length > 0}
                <canvas
                  bind:this={featureCanvas}
                  aria-label="Most requested features bar chart"
                ></canvas>
              {:else}
                <div class="h-full flex items-center justify-center text-sm text-base-content/60">
                  No feature selections recorded.
                </div>
              {/if}
            </div>
            <div class="space-y-2 text-sm">
              {#each featureStatsWithPercent as feature}
                <div class="flex items-center justify-between p-3 bg-base-200 rounded-xl">
                  <span class="font-medium">{feature.label}</span>
                  <span class="text-base-content/70">
                    {feature.count} • {feature.percentage}%
                  </span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div class="card bg-base-100 shadow-xl border border-base-300">
          <div class="card-body space-y-4">
            <div>
              <h2 class="card-title">Latest responses</h2>
              <p class="text-sm text-base-content/70">
                Quick snapshot of the most recent onboarding completions.
              </p>
            </div>
            <div class="overflow-x-auto">
              <table class="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Discovery</th>
                    <th>Features</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {#each latestResponses as response}
                    <tr>
                      <td>
                        <div class="flex flex-col">
                          <span class="font-medium">
                            {response.profile?.display_name ?? "Unknown user"}
                          </span>
                          <span class="text-xs text-base-content/60">
                            @{response.profile?.username ?? "unlinked"}
                          </span>
                        </div>
                      </td>
                      <td>{channelLabelMap[response.discovered_via]}</td>
                      <td>
                        <div class="flex flex-wrap gap-1">
                          {#if response.interested_features.length === 0}
                            <span class="badge badge-ghost badge-sm">—</span>
                          {:else}
                            {#each response.interested_features as feature}
                              <span class="badge badge-outline badge-sm">
                                {featureLabelMap[feature]}
                              </span>
                            {/each}
                          {/if}
                        </div>
                      </td>
                      <td>{formatSignupDate(response.profile?.created_at)}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl border border-base-300">
          <div class="card-body space-y-4">
            <div>
              <h2 class="card-title">Qualitative feedback</h2>
              <p class="text-sm text-base-content/70">
                Highlights from the optional "Anything else?" prompt.
              </p>
            </div>
            {#if feedbackNotes.length > 0}
              <ul class="space-y-3">
                {#each feedbackNotes as note}
                  <li class="p-4 rounded-2xl bg-base-200 border border-base-300">
                    <div class="flex items-center justify-between gap-4 mb-2">
                      <div>
                        <p class="font-semibold">
                          {note.profile?.display_name ?? "Anonymous"}
                        </p>
                        <p class="text-xs text-base-content/60">
                          {channelLabelMap[note.discovered_via]} •
                          {featureLabelList(note.interested_features)}
                        </p>
                      </div>
                      <span class="text-xs text-base-content/50">#{note.id}</span>
                    </div>
                    <p class="text-sm leading-relaxed">{note.other_text}</p>
                  </li>
                {/each}
              </ul>
            {:else}
              <div class="p-6 text-sm text-base-content/60 bg-base-200 rounded-2xl">
                No additional comments have been left yet.
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>
</section>
