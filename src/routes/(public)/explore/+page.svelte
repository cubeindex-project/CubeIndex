<script lang="ts">
  import { configCatClient } from "$lib/configcatClient";
  import FeatureDisabled from "$lib/components/featureDisabled.svelte";
  import { m } from "$lib/paraglide/messages";
  import { onMount } from "svelte";

  let databaseAvailability: boolean = $state(true);

  const cards = [
    {
      href: "cubes",
      icon: "🧊",
      title: m.explore_card_cubes_title(),
      description: m.explore_card_cubes_desc(),
    },
    {
      href: "accessories",
      icon: "🧰",
      title: m.explore_card_accessories_title(),
      description: m.explore_card_accessories_desc(),
    },
    {
      href: "vendors",
      icon: "🏬",
      title: m.explore_card_vendors_title(),
      description: m.explore_card_vendors_desc(),
    },
    {
      href: "users",
      icon: "🧍",
      title: m.explore_card_users_title(),
      description: m.explore_card_users_desc(),
    },
  ];

  onMount(() =>
    configCatClient.getValueAsync("database", false).then((value) => {
      databaseAvailability = value;
    })
  );
</script>

{#if databaseAvailability}
  <section
    class="min-h-screen flex flex-col items-center justify-center px-6 py-16 space-y-12"
  >
    <h1 class="text-4xl sm:text-5xl font-clash font-bold text-center">
      {m.explore_prompt()}
    </h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl w-full">
      {#each cards as card}
        <a
          href="/explore/{card.href}"
          class="group bg-base-200 hover:bg-base-300 transition rounded-2xl p-8 text-center flex flex-col items-center space-y-4"
        >
          <p class="text-2xl">{card.icon}</p>
          <h2 class="text-2xl font-semibold">{card.title}</h2>
          <p>{card.description}</p>
        </a>
      {/each}
    </div>
  </section>
{:else}
  <FeatureDisabled featureName="The database is" />
{/if}
