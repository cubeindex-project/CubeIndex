<script lang="ts">
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte";
  import Avatar from "$lib/components/user/avatar.svelte";
  import RoleBadge from "$lib/components/user/badge.svelte";

  const { data } = $props<{
    data: {
      profile: {
        username: string;
        display_name: string;
        role: string;
        profile_picture?: string | null;
      };
      stats: {
        cubesCount: number;
        ratingsCount: number;
        achievementsCount: number;
        followersCount: number;
        followingCount: number;
      };
      recent: {
        cubes: Array<{
          cube: string;
          created_at: string;
          main: boolean;
          status: string;
          condition: string;
          cube_data: any | null;
        }>;
        ratings: Array<{
          cube_slug: string;
          rating: number;
          updated_at: string;
          cube_data: any | null;
        }>;
        achievements: Array<{
          achievement: string;
          awarded_at: string;
          achievement_data: any | null;
        }>;
      };
    };
  }>();

  const { profile, stats, recent } = data;

  const cards = [
    {
      label: "Collection",
      value: stats.cubesCount,
      icon: "fa-box-archive",
      href: `/user/${profile.username}/cubes`,
    },
    {
      label: "Ratings",
      value: stats.ratingsCount,
      icon: "fa-star",
      href: `/user/${profile.username}/ratings`,
    },
    {
      label: "Achievements",
      value: stats.achievementsCount,
      icon: "fa-trophy",
      href: `/user/${profile.username}/achievements`,
    },
    {
      label: "Followers",
      value: stats.followersCount,
      icon: "fa-user-group",
      href: `/user/${profile.username}/social`,
    },
  ];
</script>

<svelte:head>
  <title>Dashboard - CubeIndex</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8">
  <header class="mb-8">
    <div class="flex md:items-center gap-4 flex-col justify-start md:flex-row">
      <Avatar
        profile={{
          display_name: profile.display_name || profile.username,
          profile_picture: profile.profile_picture ?? null,
        }}
        imgSize="w-16 h-16"
        textSize="text-xl"
      />
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-clash tracking-tight">
            Welcome back, {profile.display_name || profile.username}
          </h1>
        </div>
        <p class="text-base-content/70 mt-1">
          Here’s your personal overview and recent activity.
        </p>
      </div>
    </div>
  </header>

  <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
    {#each cards as c}
      <a
        href={c.href}
        class="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition"
      >
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-70">{c.label}</p>
              <p class="text-3xl font-extrabold">{c.value}</p>
            </div>
            <i class={`fa-solid ${c.icon} text-2xl opacity-70`}></i>
          </div>
        </div>
      </a>
    {/each}
    <!-- Add a CTA card -->
    <a
      href="/explore/cubes"
      class="card bg-primary text-primary-content shadow-md hover:shadow-lg transition"
    >
      <div class="card-body items-start">
        <p class="text-sm opacity-90">Get Started</p>
        <p class="text-2xl font-extrabold">Explore Cubes</p>
        <span class="opacity-90 text-sm">
          Find cubes to add to your collection.
        </span>
      </div>
    </a>
  </section>

  <section class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
    <!-- Recent Collection -->
    <div class="card bg-base-100 border border-base-300 xl:col-span-1">
      <div class="card-body">
        <h2 class="card-title">Recent Collection</h2>
        {#if recent.cubes.length === 0}
          <div class="text-sm opacity-70">
            No cubes yet. <a class="link" href="/explore/cubes">Explore cubes</a
            > to start your collection.
          </div>
        {:else}
          <ul class="divide-y divide-base-300">
            {#each recent.cubes as r}
              <li class="py-3 flex items-center gap-3">
                {#if r.cube_data?.image_url}
                  <img
                    src={r.cube_data.image_url}
                    alt={r.cube_data.model}
                    class="w-10 h-10 rounded object-cover"
                  />
                {:else}
                  <div
                    class="w-10 h-10 rounded bg-base-300 flex items-center justify-center"
                  >
                    <i class="fa-solid fa-cube"></i>
                  </div>
                {/if}
                <div class="min-w-0">
                  <a
                    class="font-medium hover:underline"
                    href={`/explore/cubes/${r.cube}`}
                    >{r.cube_data?.brand} {r.cube_data?.model ?? r.cube}</a
                  >
                  <div class="text-xs opacity-70">
                    {formatDate(r.created_at)} • {r.status}{r.main
                      ? " • Main"
                      : ""}
                  </div>
                </div>
              </li>
            {/each}
          </ul>
          <div class="pt-3">
            <a class="btn btn-sm" href={`/user/${profile.username}/cubes`}>
              View all
            </a>
          </div>
        {/if}
      </div>
    </div>

    <!-- Recent Ratings -->
    <div class="card bg-base-100 border border-base-300 xl:col-span-1">
      <div class="card-body">
        <h2 class="card-title">Recent Ratings</h2>
        {#if recent.ratings.length === 0}
          <div class="text-sm opacity-70">
            No ratings yet. Rate cubes from their pages.
          </div>
        {:else}
          <ul class="divide-y divide-base-300">
            {#each recent.ratings as r}
              <li class="py-3 flex items-center gap-3">
                {#if r.cube_data?.image_url}
                  <img
                    src={r.cube_data.image_url}
                    alt={r.cube_data.model}
                    class="w-10 h-10 rounded object-cover"
                  />
                {:else}
                  <div
                    class="w-10 h-10 rounded bg-base-300 flex items-center justify-center"
                  >
                    <i class="fa-solid fa-cube"></i>
                  </div>
                {/if}
                <div class="min-w-0">
                  <a
                    class="font-medium hover:underline"
                    href={`/explore/cubes/${r.cube_slug}`}
                  >
                    {r.cube_data?.brand}
                    {r.cube_data?.model ?? r.cube_slug}
                  </a>
                  <div class="text-xs opacity-70">
                    {formatDate(r.updated_at)} • Rated {r.rating.toFixed(1)}★
                  </div>
                </div>
              </li>
            {/each}
          </ul>
          <div class="pt-3">
            <a class="btn btn-sm" href={`/user/${profile.username}/ratings`}>
              View all
            </a>
          </div>
        {/if}
      </div>
    </div>

    <!-- Recent Achievements -->
    <div class="card bg-base-100 border border-base-300 xl:col-span-1">
      <div class="card-body">
        <h2 class="card-title">Recent Achievements</h2>
        {#if recent.achievements.length === 0}
          <div class="text-sm opacity-70">
            No achievements yet. Keep collecting and engaging!
          </div>
        {:else}
          <ul class="divide-y divide-base-300">
            {#each recent.achievements as a}
              <li class="py-3 flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded bg-base-300 flex items-center justify-center"
                >
                  {a.achievement_data.icon}
                </div>
                <div class="min-w-0">
                  <span class="font-medium">
                    {a.achievement_data.name}
                  </span>
                  <div class="text-xs opacity-70">
                    {formatDate(a.awarded_at)} • {a.achievement_data?.rarity ??
                      ""}
                  </div>
                </div>
              </li>
            {/each}
          </ul>
          <div class="pt-3">
            <a
              class="btn btn-sm"
              href={`/user/${profile.username}/achievements`}
            >
              View all
            </a>
          </div>
        {/if}
      </div>
    </div>
  </section>

  <section class="card bg-base-100 border border-base-300">
    <div class="card-body">
      <h2 class="card-title">Quick Actions</h2>
      <div class="flex flex-wrap gap-3">
        <a class="btn btn-primary" href={`/user/${profile.username}`}>
          View Profile
        </a>
        <a class="btn" href={`/user/${profile.username}/cubes`}>
          Manage Collection
        </a>
        <a class="btn" href={`/user/${profile.username}/ratings`}>My Ratings</a>
        <a class="btn" href="/achievements">Browse Achievements</a>
        <a class="btn" href="/explore/users">Discover Users</a>
        <a class="btn" href="/userbar">Userbar</a>
      </div>
    </div>
  </section>
</div>
