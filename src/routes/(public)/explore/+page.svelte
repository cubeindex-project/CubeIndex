<script lang="ts">
  import { configCatClient } from "$lib/configcatClient";
  import FeatureDisabled from "$lib/components/featureDisabled.svelte";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let databaseAvailability: boolean = $state(true);

  onMount(() =>
    configCatClient.getValueAsync("database", false).then((value) => {
      databaseAvailability = value;
    }),
  );
</script>

{#if databaseAvailability}
  <section
    class="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16 space-y-12"
  >
    <h1 class="text-4xl sm:text-5xl font-clash font-bold text-center">
      What would you like to explore?
    </h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl w-full">
      <!-- Explore Cubes Card -->
      <a
        href="/explore/cubes"
        class="group bg-neutral-900 hover:bg-neutral-800 transition rounded-2xl p-8 text-center flex flex-col items-center space-y-4"
      >
        <p class="text-2xl">🧊</p>
        <h2 class="text-2xl font-semibold">Cubes</h2>
        <p class="text-gray-400">
          Browse thousands of cubes by brand, type, and community rating.
        </p>
      </a>

      <!-- Explore Accessories Card -->
      <a
        href="/explore/accessories"
        class="group bg-neutral-900 hover:bg-neutral-800 transition rounded-2xl p-8 text-center flex flex-col items-center space-y-4"
      >
        <p class="text-2xl">🧰</p>
        <h2 class="text-2xl font-semibold">Accessories</h2>
        <p class="text-gray-400">
          Discover timers, mats, lubricants, and everything else you need.
        </p>
      </a>

      <!-- Explore Vendors Card -->
      <a
        href="/explore/vendors"
        class="group bg-neutral-900 hover:bg-neutral-800 transition rounded-2xl p-8 text-center flex flex-col items-center space-y-4"
      >
        <p class="text-2xl">🏬</p>
        <h2 class="text-2xl font-semibold">Vendors</h2>
        <p class="text-gray-400">
          Find trusted cube shops and compare prices from top vendors worldwide.
        </p>
      </a>

      <!-- Explore Users Card -->
      <a
        href="/explore/users"
        class="group bg-neutral-900 hover:bg-neutral-800 transition rounded-2xl p-8 text-center flex flex-col items-center space-y-4"
      >
        <p class="text-2xl">🧍</p>
        <h2 class="text-2xl font-semibold">Users</h2>
        <p class="text-gray-400">
          Explore user profiles, discover top solvers, and see community
          activity.
        </p>
      </a>
    </div>
  </section>
{:else}
  <FeatureDisabled featureName="The database is" />
{/if}
