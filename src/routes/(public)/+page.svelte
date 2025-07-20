<script lang="ts">
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
      description:
        "CubingPanda is the go-to community for Rubik's Cube fans at every skill level—whether you're a veteran speedcuber or someone who's never solved a single face.",
      links: [
        {
          label: "Join Discord",
          url: "https://discord.gg/VHhYR6nyzs",
          color: "blue",
        },
      ],
      border: true,
    },
    {
      name: "AlgArchive",
      emoji: "📚",
      description:
        "The open archive for cube algorithms. Browse community-vetted solutions across every puzzle type, tag them with your average-of-5, and share your PB-crushing secrets.",
      links: [
        {
          label: "Visit Site",
          url: "https://alg-archive.vercel.app/",
          color: "green",
        },
        {
          label: "Join Discord",
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
      Build Your Ultimate Cube Collection
    </h1>
    <p class="text-lg sm:text-xl">
      Track your cubes, unlock badges, and explore the world's largest cube
      database.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/auth/signup" class="btn btn-xl btn-primary">
        Start Collecting
      </a>
      <a href="/explore" class="btn btn-xl"> Explore Database </a>
    </div>
  </div>
</section>

<section class="py-16 px-5 text-center bg-base-200">
  <h2 class="text-4xl font-clash font-extrabold mb-14">CubeIndex in Numbers</h2>

  <div class="stats lg:stats-horizontal stats-vertical overflow-hidden">
    <div class="stat flex-1">
      <div class="stat-title text-sm uppercase tracking-wide">
        <i class="fa-solid fa-cubes"></i>
        Cubes Logged
      </div>
      <div class="stat-value text-5xl font-bold mb-2">
        <NumberFlow
          value={mounted ? totalCubes : 0}
          plugins={[continuous]}
          transformTiming={{ duration: 50, easing: "linear" }}
          spinTiming={{ duration: totalCubes / 10, easing: "linear" }}
          opacityTiming={{ duration: 500, easing: "ease-out" }}
          class="inline-block"
        />
      </div>
    </div>

    <div class="stat flex-1">
      <div class="stat-title text-sm uppercase tracking-wide">
        <i class="fa-solid fa-people-group"></i>
        Registered Users
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
        Unlockable Achievements
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
  <h2 class="text-4xl font-clash font-bold text-center mb-12">Our Partners</h2>
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
    Ready to level up your cube game?
  </h2>
  <p class="text-lg max-w-2xl mx-auto mb-8">
    Join the CubeIndex community and start tracking your collection, unlocking
    achievements, and connecting with cubers worldwide.
  </p>
  <div class="flex justify-center gap-4 flex-wrap">
    <a
      href="/auth/signup"
      class="btn btn-primary btn-lg px-6 py-3 font-semibold transition-transform"
    >
      Get Started
    </a>
    <a
      href="/explore"
      class="btn btn-outline btn-lg px-6 py-3 font-semibold transition-transform"
    >
      Explore Cubes
    </a>
  </div>
</section>
