<script lang="ts">
  import type { PageData } from "./$types";
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte";
  import Markdown from "$lib/components/misc/markdown.svelte";

  let { data }: { data: PageData } = $props();

  const profile = $derived(data.profile);
  const main_cubes = $derived(data.main_cubes);
  const user_cubes = $derived(data.user_cubes);
  const user_achievements = $derived(data.user_achievements);
  const user_cube_ratings = $derived(data.user_cube_ratings);

  const totalCubes = $derived(user_cubes.length);
  const totalAchievements = $derived(user_achievements.length);
  const totalRatings = $derived(user_cube_ratings.length);

  const averageRating = $derived(
    totalRatings
      ? user_cube_ratings.map((r) => r.rating ?? 0).reduce((a, b) => a + b, 0) /
          totalRatings
      : 0,
  );

  const averageDisplay = $derived(
    totalRatings ? averageRating.toFixed(1) : "—",
  );
  const avgRounded = $derived(Math.round(averageRating)); // for star fill

  // Helpers
  function cubeTitle(c: any) {
    const series = c?.cube_model?.series ?? c?.series ?? "";
    const model = c?.cube_model?.model ?? c?.model ?? "";
    const version = c?.cube_model?.version_name ?? c?.version_name ?? "";
    return `${series} ${model} ${version}`.trim();
  }

  // Derived previews/overviews
  /**
   * Unified activity feed items.
   */
  interface ActivityItemBase {
    /** Milliseconds since epoch for sorting and display. */
    ts: number;
    /** Unique key for keyed each blocks. */
    key: string;
  }

  interface RatingActivity extends ActivityItemBase {
    type: "rating";
    item: (typeof user_cube_ratings)[number];
  }

  interface CubeActivity extends ActivityItemBase {
    type: "cube";
    item: (typeof user_cubes)[number];
  }

  interface AchievementActivity extends ActivityItemBase {
    type: "achievement";
    item: (typeof user_achievements)[number];
  }

  type ActivityItem = RatingActivity | CubeActivity | AchievementActivity;

  const activityItems = $derived(
    (
      [
        // Ratings
        ...user_cube_ratings.map((r) => ({
          type: "rating" as const,
          item: r,
          ts: r.created_at ? new Date(r.created_at).getTime() : 0,
          key: `rating:${r.cube_slug}:${r.created_at}`,
        })),
        // Cubes added/acquired
        ...user_cubes.map((c) => ({
          type: "cube" as const,
          item: c,
          ts: c.acquired_at ? new Date(c.acquired_at).getTime() : 0,
          key: `cube:${c.cube}:${c.acquired_at}`,
        })),
        // Achievements
        ...user_achievements.map((a, index) => ({
          type: "achievement" as const,
          item: a,
          ts: a.awarded_at
            ? new Date(a.awarded_at).getTime()
            : a.created_at
              ? new Date(a.created_at).getTime()
              : 0,
          key: `achievement:${index}`,
        })),
      ] satisfies ActivityItem[]
    )
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 12),
  );

  const typeCounts = $derived(
    Object.entries(
      user_cubes.reduce((acc: Record<string, number>, uc: any) => {
        const t = uc?.cube_model?.type ?? "Unknown";
        acc[t] = (acc[t] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
  );

  const statusCounts = $derived(
    Object.entries(
      user_cubes.reduce((acc: Record<string, number>, uc: any) => {
        const s = uc?.status ?? "Unknown";
        acc[s] = (acc[s] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([status, count]) => ({ status, count })),
  );
</script>

<div
  class="min-h-screen lg:mx-24 p-6 grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4"
>
  <div class="col-span-1 flex flex-col gap-6">
    <!-- Bio Card -->
    {#if profile.bio}
      <div>
        <h2 class="text-xl font-semibold mb-2">Bio</h2>

        <div
          class="card !bg-base-200 p-4 rounded-2xl max-h-96 overflow-auto markdown-body !text-base-content"
        >
          <Markdown text={profile.bio} />
        </div>
      </div>
    {/if}

    <!-- Stats Card -->
    <div>
      <h2 class="text-xl font-semibold mb-4">Stats</h2>
      <div class="stats stats-vertical bg-base-200 rounded-2xl gap-2 w-full">
        <!-- Total Cubes -->
        <div class="stat">
          <div class="stat-figure text-primary">
            <i class="fa-solid fa-cube text-2xl"></i>
          </div>
          <div class="stat-title">Total Cubes</div>
          <div class="stat-value">{totalCubes}</div>
        </div>

        <!-- Total Achievements -->
        <div class="stat">
          <div class="stat-figure text-secondary">
            <i class="fa-solid fa-trophy text-2xl"></i>
          </div>
          <div class="stat-title">Achievements</div>
          <div class="stat-value">{totalAchievements}</div>
        </div>

        <!-- Total Ratings -->
        <div class="stat">
          <div class="stat-figure text-info">
            <i class="fa-solid fa-clipboard-check text-2xl"></i>
          </div>
          <div class="stat-title">Ratings</div>
          <div class="stat-value">{totalRatings}</div>
          <div class="stat-desc">
            {#if totalRatings === 0}
              No ratings yet
            {:else if totalRatings === 1}
              1 rating given
            {:else}
              {totalRatings} ratings given
            {/if}
          </div>
        </div>

        <!-- Average Rating -->
        <div class="stat">
          <div class="stat-figure text-warning">
            <i class="fa-solid fa-star text-2xl"></i>
          </div>
          <div class="stat-title">Average Rating</div>
          <div class="stat-value flex items-center gap-2">
            {averageDisplay}
            <div class="rating rating-sm" title={`Average: ${averageDisplay}`}>
              {#each [1, 2, 3, 4, 5] as n}
                <input
                  type="radio"
                  class="mask mask-star-2 bg-warning"
                  disabled
                  checked={avgRounded >= n && totalRatings > 0}
                />
              {/each}
            </div>
          </div>
          <div class="stat-desc">
            {totalRatings > 0 ? "Based on recent ratings" : "—"}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Cubes -->
  <div class="col-span-full lg:col-span-2 flex flex-col gap-6">
    {#if main_cubes.length > 0}
      <div>
        <h2 class="text-xl font-semibold mb-2">Main Cubes</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each main_cubes as mc, i ("main:" + i)}
            <a class="group block" href="/explore/cubes/{mc.cube}">
              <article
                class="relative overflow-hidden rounded-2xl border border-base-300 bg-base-200 shadow-sm transition hover:shadow-md"
              >
                <img
                  src="https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_400/{mc
                    .cube_model.image_url}"
                  alt={cubeTitle(mc)}
                  class="w-full h-40 object-cover"
                  loading="lazy"
                />
                <div class="p-4">
                  <h3 class="font-semibold truncate">{cubeTitle(mc)}</h3>
                  <p class="text-sm text-base-content/70 truncate">
                    {mc.cube_model.type} ・ {mc.cube_model.brand}
                  </p>
                  {#if mc.acquired_at}
                    <div class="mt-1 text-xs text-base-content/60">
                      Acquired {formatDate(mc.acquired_at)}
                    </div>
                  {/if}
                </div>
              </article>
            </a>
          {:else}
            This user hasn't set any cubes as their main
          {/each}
        </div>
      </div>
    {/if}

    <!-- Activity -->
    <div class="col-span-full lg:col-span-2">
      <h2 class="text-xl font-semibold mb-2">Activity</h2>
      <div class="bg-base-200 rounded-2xl border border-base-300 p-4">
        <ul class="space-y-3">
          {#each activityItems as a (a.key)}
            {#if a.type === "rating"}
              {@const r = a.item}
              <li class="flex items-center gap-3">
                <a href="/explore/cubes/{r.cube_slug}" class="shrink-0">
                  <img
                    src="https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_72,h_72,c_fill/{r
                      .cube_model.image_url}"
                    alt={cubeTitle(r.cube_model)}
                    class="rounded-xl border border-base-300"
                    width="72"
                    height="72"
                    loading="lazy"
                  />
                </a>
                <div class="min-w-0 flex-1">
                  <a
                    class="font-medium block truncate"
                    href="/explore/cubes/{r.cube_slug}"
                  >
                    Rated {cubeTitle(r.cube_model)}
                  </a>
                  <div class="mt-1">
                    <div class="rating rating-xs" title={`Rated ${r.rating}`}>
                      {#each [1, 2, 3, 4, 5] as n}
                        <input
                          type="radio"
                          class="mask mask-star-2 bg-warning"
                          disabled
                          checked={r.rating >= n}
                        />
                      {/each}
                    </div>
                  </div>
                  <div class="text-xs text-base-content/70 mt-1">
                    {formatDate(r.created_at)}
                  </div>
                </div>
              </li>
            {:else if a.type === "cube"}
              {@const c = a.item}
              <li class="flex items-center gap-3">
                <a href="/explore/cubes/{c.cube}" class="shrink-0">
                  <img
                    src="https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_72,h_72,c_fill/{c
                      .cube_model.image_url}"
                    alt={cubeTitle(c)}
                    class="rounded-xl border border-base-300"
                    width="72"
                    height="72"
                    loading="lazy"
                  />
                </a>
                <div class="min-w-0 flex-1">
                  <a
                    class="font-medium block truncate"
                    href="/explore/cubes/{c.cube}"
                  >
                    Added {cubeTitle(c)} to collection
                  </a>
                  <div class="text-xs text-base-content/70 mt-1">
                    {c.acquired_at ? formatDate(c.acquired_at) : "—"}
                  </div>
                </div>
              </li>
            {:else}
              {@const ach = a.item}
              <li class="flex items-center gap-3">
                <div class="shrink-0 text-2xl select-none" aria-hidden="true">
                  {ach.achievement.icon}
                </div>
                <div class="min-w-0 flex-1">
                  <a
                    class="font-medium block truncate"
                    href="/user/{profile.username}/achievements"
                  >
                    Unlocked achievement {ach.achievement.name}
                  </a>
                  <div class="text-xs text-base-content/70 mt-1">
                    {ach.awarded_at
                      ? formatDate(ach.awarded_at)
                      : ach.created_at
                        ? formatDate(ach.created_at)
                        : "—"}
                  </div>
                </div>
              </li>
            {/if}
          {:else}
            <li class="text-sm opacity-70">No recent activity.</li>
          {/each}
        </ul>
      </div>
    </div>
  </div>

  <!-- Collection Overview -->
  <div class="xl:col-span-1 flex flex-col gap-6">
    <div>
      <h2 class="text-xl font-semibold mb-2">Collection Overview</h2>
      <div class="bg-base-200 rounded-2xl border border-base-300 p-4">
        <div>
          <h3 class="font-semibold mb-2 text-sm text-base-content/70">
            Top Types
          </h3>
          <div class="flex flex-wrap gap-2">
            {#each typeCounts as t (t.type)}
              <span class="badge badge-ghost">
                {t.type}
                <span class="ml-1 text-xs opacity-70">x{t.count}</span>
              </span>
            {/each}
            {#if typeCounts.length === 0}
              <span class="text-sm opacity-70">No types yet.</span>
            {/if}
          </div>
        </div>
        <div class="divider my-3"></div>
        <div>
          <h3 class="font-semibold mb-2 text-sm text-base-content/70">
            By Status
          </h3>
          <div class="flex flex-wrap gap-2">
            {#each statusCounts as s (s.status)}
              <span class="badge badge-outline">
                {s.status}
                <span class="ml-1 text-xs opacity-70">x{s.count}</span>
              </span>
            {/each}
            {#if statusCounts.length === 0}
              <span class="text-sm opacity-70">No cubes yet.</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
