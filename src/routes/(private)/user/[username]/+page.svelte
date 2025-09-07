<script lang="ts">
  import type { PageData } from "./$types";
  import DOMPurify from "isomorphic-dompurify";
  import UserCubeCard from "$lib/components/cube/userCubeCard.svelte";
  import Markdown from "svelte-exmarkdown";
  import { gfmPlugin } from "svelte-exmarkdown/gfm";
  import "github-markdown-css/github-markdown.css";
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte";

  const plugins = [gfmPlugin()];

  let { data }: { data: PageData } = $props();

  const profile = $derived(data.profile);
  const bio = $derived(DOMPurify.sanitize(profile.bio));
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
      : 0
  );

  const averageDisplay = $derived(
    totalRatings ? averageRating.toFixed(1) : "—"
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
  const recentCubes = $derived(
    [...user_cubes]
      .sort((a, b) => {
        const ad = a.acquired_at ? new Date(a.acquired_at).getTime() : 0;
        const bd = b.acquired_at ? new Date(b.acquired_at).getTime() : 0;
        return bd - ad;
      })
      .slice(0, 6)
  );

  const recentRatings = $derived(
    [...user_cube_ratings]
      .sort((a, b) => {
        const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bd - ad;
      })
      .slice(0, 5)
  );

  const recentAchievements = $derived(
    [...user_achievements]
      .sort((a, b) => {
        const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bd - ad;
      })
      .slice(0, 6)
  );

  const typeCounts = $derived(
    Object.entries(
      user_cubes.reduce((acc: Record<string, number>, uc: any) => {
        const t = uc?.cube_model?.type ?? "Unknown";
        acc[t] = (acc[t] ?? 0) + 1;
        return acc;
      }, {})
    )
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  );

  const statusCounts = $derived(
    Object.entries(
      user_cubes.reduce((acc: Record<string, number>, uc: any) => {
        const s = uc?.status ?? "Unknown";
        acc[s] = (acc[s] ?? 0) + 1;
        return acc;
      }, {})
    ).map(([status, count]) => ({ status, count }))
  );
</script>

<svelte:head>
  <title>{profile.display_name}'s Profile - CubeIndex</title>
</svelte:head>

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
          <Markdown md={bio} {plugins} />
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

    <!-- Quick Links -->
    <div>
      <h2 class="text-xl font-semibold mb-2">Quick Links</h2>
      <div class="grid grid-cols-2 gap-2">
        <a class="btn btn-outline" href="/user/{profile.username}/cubes">
          <i class="fa-solid fa-cubes"></i>
          Cubes
        </a>
        <a class="btn btn-outline" href="/user/{profile.username}/ratings">
          <i class="fa-solid fa-star"></i>
          Ratings
        </a>
        <a class="btn btn-outline" href="/user/{profile.username}/achievements">
          <i class="fa-solid fa-trophy"></i>
          Achievements
        </a>
        <a class="btn btn-outline" href="/user/{profile.username}/social">
          <i class="fa-solid fa-users"></i>
          Social
        </a>
      </div>
    </div>

    <!-- Recent Ratings -->
    <div class="xl:col-span-1">
      <h2 class="text-xl font-semibold mb-2">Recent Ratings</h2>
      <div class="bg-base-200 rounded-2xl border border-base-300 p-4">
        <ul class="space-y-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
          {#each recentRatings as r}
            <li class="flex items-center gap-3">
              <img
                src="https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_72,h_72,c_fill/{r
                  .cube_model.image_url}"
                alt={cubeTitle(r.cube_model)}
                class="rounded-xl border border-base-300"
                width="72"
                height="72"
                loading="lazy"
              />
              <div class="min-w-0">
                <a
                  class="font-medium block truncate"
                  href="/explore/cubes/{r.cube_slug}"
                  >{cubeTitle(r.cube_model)}</a
                >
                <div class="text-sm text-base-content/70">
                  {formatDate(r.created_at)}
                </div>
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
              </div>
            </li>
          {:else}
            <li class="text-sm opacity-70">No ratings yet.</li>
          {/each}
        </ul>
      </div>
    </div>
  </div>

  <!-- Main Cubes -->
  <div class="col-span-full lg:col-span-2 flex flex-col gap-6">
    <div>
      <h2 class="text-xl font-semibold mb-2">Main Cubes</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each main_cubes as mc}
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

    <!-- Recently Added Cubes -->
    <div class="col-span-2">
      <h2 class="text-xl font-semibold mb-2">Recently Added Cubes</h2>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {#each recentCubes as rc (rc.cube)}
          <a class="group block" href="/explore/cubes/{rc.cube}">
            <article
              class="relative overflow-hidden rounded-2xl border border-base-300 bg-base-200 shadow-sm transition hover:shadow-md"
            >
              <img
                src="https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_400/{rc
                  .cube_model.image_url}"
                alt={cubeTitle(rc)}
                class="w-full h-40 object-cover"
                loading="lazy"
              />
              <div class="p-4">
                <h3 class="font-semibold truncate">{cubeTitle(rc)}</h3>
                <p class="text-sm text-base-content/70 truncate">
                  {rc.cube_model.type} ・ {rc.cube_model.brand}
                </p>
                {#if rc.acquired_at}
                  <div class="mt-1 text-xs text-base-content/60">
                    Acquired {formatDate(rc.acquired_at)}
                  </div>
                {/if}
              </div>
            </article>
          </a>
        {:else}
          <div class="text-sm opacity-70">No cubes yet.</div>
        {/each}
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
            {#each typeCounts as t}
              <span class="badge badge-ghost">
                {t.type}
                <span class="ml-1 text-xs opacity-70">×{t.count}</span>
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
            {#each statusCounts as s}
              <span class="badge badge-outline">
                {s.status}
                <span class="ml-1 text-xs opacity-70">×{s.count}</span>
              </span>
            {/each}
            {#if statusCounts.length === 0}
              <span class="text-sm opacity-70">No cubes yet.</span>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Achievements -->
    <div>
      <h2 class="text-xl font-semibold mb-2">Recent Achievements</h2>
      <div class="grid grid-cols-1 gap-4">
        {#each recentAchievements as a}
          <article
            class="bg-base-200 rounded-2xl border border-base-300 p-4 flex items-center gap-3"
          >
            <div class="text-2xl select-none" aria-hidden="true">
              <p>{a.achievement.icon}</p>
            </div>
            <div class="min-w-0">
              <div class="font-semibold truncate">{a.achievement.name}</div>
              <div class="text-sm text-base-content/70">
                {formatDate(a.awarded_at)}
              </div>
            </div>
          </article>
        {:else}
          <div class="text-sm opacity-70">No achievements yet.</div>
        {/each}
      </div>
    </div>
  </div>
</div>
