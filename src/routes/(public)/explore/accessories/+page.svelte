<script lang="ts">
    import { configCatClient } from "$lib/configcatClient";
    import FeatureDisabled from "$lib/components/featureDisabled.svelte";
    import StarRating from "$lib/components/starRating.svelte";
    import { formatDate } from "$lib/components/formatDate.svelte";

    let { data } = $props();
    const { accessories } = data;
    let databaseAvailability: boolean = $state(true);
    let accessoriesAvailability: boolean = $state(true);

  configCatClient.getValueAsync("database", false).then((value) => {
    databaseAvailability = value;
  });
  configCatClient.getValueAsync("accessories", false).then((value) => {
    accessoriesAvailability = value;
  });
</script>

{#if databaseAvailability && accessoriesAvailability}
  <section class="min-h-screen px-6 py-16 relative">
    <div class="relative z-10 max-w-7xl mx-auto">
      <h1 class="text-4xl font-bold mb-6 font-clash text-center">
        Explore Accessories
      </h1>
      <p class="mb-12 text-center">
        Discover the best cube timers, mats, lubricants, and more—handpicked by
        our community.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each accessories as acc}
          <div
            class="bg-base-200 border border-base-300 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
          >
            <img
              src={acc.image_url ?? "/images/placeholder-accessory.png"}
              alt={acc.name}
              class="w-full h-48 object-cover"
            />
            <div class="p-5 space-y-2">
              <h2 class="text-xl font-bold">{acc.name}</h2>
              <p class="text-sm">
                {acc.brand} ・ {acc.category}
              </p>
              {#if acc.compatibility}
                <p class="text-sm">
                  <strong>Compatibility:</strong>
                  {acc.compatibility}
                </p>
              {/if}
              <div class="text-sm text-yellow-400">
                <StarRating rating={acc.rating} large={false} />
              </div>
              <p class="text-sm">
                Released: {formatDate(acc.release_date)}
              </p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>
{:else if !accessoriesAvailability}
  <FeatureDisabled featureName="The accessories explore page is" />
{:else if !databaseAvailability}
  <FeatureDisabled featureName="The database is" />
{/if}
