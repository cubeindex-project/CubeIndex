<script lang="ts">
  import { m } from "$lib/paraglide/messages.js";
  import NumberFlow, { continuous } from "@number-flow/svelte";
  import { onMount } from "svelte";

  const { data } = $props();
  const { totalCubes, totalUsers, achievements } = $derived(
    data || { totalCubes: 0, totalUsers: 0, achievements: [] }
  );
  let mounted = $state(false);

  const unlockAchi = () => {
    return achievements.filter((ta) => ta.unlockable === true).length;
  };

  const totalAchi = () => {
    return achievements.length;
  };

  type Partner = {
    name: string;
    emoji: string;
    description: string;
    links: { label: string; url: string; color: string }[];
    border?: boolean;
  };

  const partners: Partner[] = [
    {
      name: "CubingPanda",
      emoji: "🐼",
      description: `${m.cubingpanda_community()}`,
      links: [
        {
          label: `${m.join_discord()}`,
          url: "https://discord.gg/VHhYR6nyzs",
          color: "blue",
        },
      ],
      border: true,
    },
    {
      name: "AlgArchive",
      emoji: "📚",
      description: `${m.open_archive_algorithms()}`,
      links: [
        {
          label: `${m.visit_site()}`,
          url: "https://alg-archive.vercel.app/",
          color: "green",
        },
        {
          label: `${m.join_discord()}`,
          url: "https://discord.gg/NYPG43xe9t",
          color: "blue",
        },
      ],
      border: false,
    },
  ];

  onMount(() => {
    mounted = true;
  });
</script>

<section
  class="px-5 relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
>
  <div class="relative z-10 text-center max-w-3xl space-y-6">
    <h1 class="text-5xl sm:text-7xl font-clash font-bold">
      {m.build_ultimate_collection()}
    </h1>
    <p class="text-lg sm:text-xl">
      {m.track_unlock_explore()}
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/auth/signup" class="btn btn-xl btn-primary">
        {m.start_collecting()}
      </a>
      <a href="/explore" class="btn btn-xl">
        {m.explore_database()}
      </a>
    </div>
  </div>
</section>

<section class="py-16 px-5 text-center bg-base-200">
  <h2 class="text-4xl font-clash font-extrabold mb-14">
    {m.cubeindex_in_numbers()}
  </h2>

  <div class="stats lg:stats-horizontal stats-vertical overflow-hidden">
    <div class="stat flex-1">
      <div class="stat-title text-sm uppercase tracking-wide">
        <i class="fa-solid fa-cubes"></i>
        {m.cubes_logged()}
      </div>
      <div class="stat-value text-5xl font-bold mb-2">
        <NumberFlow
          value={mounted ? totalCubes : 0}
          plugins={[continuous]}
          transformTiming={{ duration: 50, easing: "linear" }}
          spinTiming={{ duration: totalCubes * 10, easing: "linear" }}
          opacityTiming={{ duration: 500, easing: "ease-out" }}
          class="inline-block"
        />
      </div>
    </div>

    <div class="stat flex-1">
      <div class="stat-title text-sm uppercase tracking-wide">
        <i class="fa-solid fa-people-group"></i>
        {m.registered_users()}
      </div>
      <div class="stat-value text-5xl font-bold mb-2">
        <NumberFlow
          value={mounted ? totalUsers : 0}
          plugins={[continuous]}
          transformTiming={{ duration: 50, easing: "linear" }}
          spinTiming={{ duration: totalUsers * 10, easing: "linear" }}
          opacityTiming={{ duration: 500, easing: "ease-out" }}
          class="inline-block"
        />
      </div>
    </div>

    <div class="stat flex-1">
      <div class="stat-title text-sm uppercase tracking-wide">
        <i class="fa-solid fa-trophy"></i>
        {m.unlockable_achievements()}
      </div>
      <div class="stat-value text-5xl font-bold mb-2">
        <NumberFlow
          value={mounted ? unlockAchi() : 0}
          plugins={[continuous]}
          transformTiming={{ duration: 50, easing: "linear" }}
          spinTiming={{
            duration: unlockAchi() * 10,
            easing: "linear",
          }}
          opacityTiming={{ duration: 500, easing: "ease-out" }}
          class="inline-block"
        /> / {totalAchi()}
      </div>
    </div>
  </div>
</section>

<section
  class="pt-16 pb-24 px-5 relative flex flex-col items-center justify-center overflow-hidden"
>
  <h2 class="text-4xl font-clash font-bold text-center mb-12">
    {m.our_partners()}
  </h2>
  <div
    class="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-y-12 gap-x-8 w-full"
  >
    {#each partners as partner, i}
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <span class="text-6xl sm:text-5xl">{partner.emoji}</span>
        <div class="flex-1 flex flex-col items-center sm:items-start">
          <h3 class="text-2xl font-semibold mb-1">{partner.name}</h3>
          <p class=" mb-4 text-center sm:text-left">
            {partner.description}
          </p>
          <div class="flex gap-3 flex-wrap">
            {#each partner.links as link}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                class="px-4 py-2 rounded-lg font-medium shadow transition
                  {link.color === 'blue'
                  ? 'bg-primary text-primary-content hover:bg-primary'
                  : link.color === 'green'
                    ? 'bg-secondary text-secondary-content'
                    : 'bg-neutral-700 hover:bg-neutral-800'}"
              >
                {link.label}
              </a>
            {/each}
          </div>
        </div>
        {#if partner.border}
          <div class="divider divider-vertical sm:divider-horizontal"></div>
        {/if}
      </div>
    {/each}
  </div>
</section>

<section class="py-20 px-6 text-center bg-base-200 mt-16">
  <h2 class="text-4xl font-bold font-clash mb-4">
    {m.ready_to_level_up()}
  </h2>
  <p class="text-lg max-w-2xl mx-auto mb-8">
    {m.join_community()}
  </p>
  <div class="flex justify-center gap-4 flex-wrap">
    <a
      href="/auth/signup"
      class="btn btn-primary btn-lg px-6 py-3 font-semibold transition-transform"
    >
      {m.get_started()}
    </a>
    <a
      href="/explore"
      class="btn btn-outline btn-lg px-6 py-3 font-semibold transition-transform"
    >
      {m.explore_cubes()}
    </a>
  </div>
</section>
