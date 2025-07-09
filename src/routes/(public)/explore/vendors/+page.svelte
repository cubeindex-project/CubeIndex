<script lang="ts">
    import { configCatClient } from "$lib/configcatClient";
    import FeatureDisabled from "$lib/components/featureDisabled.svelte";
    import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const vendors = data.vendors ?? [];
  let databaseAvailability: boolean = $state(true);
  let vendorsAvailability: boolean = $state(true);

  // Function to convert ISO country code to flag emoji
  function getFlagEmoji(countryCode: string): string {
    return String.fromCodePoint(
      ...countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0))
    );
  }

  configCatClient.getValueAsync("database", false).then((value) => {
    databaseAvailability = value;
  });
  configCatClient.getValueAsync("vendors", false).then((value) => {
    vendorsAvailability = value;
  });
</script>

{#if databaseAvailability}
  <section class="min-h-screen bg-base-100 px-6 py-16">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-4xl sm:text-5xl font-clash font-bold mb-10 text-center">
        Explore Vendors
      </h1>
      <p class="text-center text-gray-400 mb-12">
        Find the best shops and trusted vendors in the cubing world.
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each vendors as vendor}
          <a
            href={vendor.base_url}
            target="_blank"
            rel="noopener noreferrer"
            class="bg-base-200 border border-base-300 rounded-2xl shadow-lg overflow-hidden flex flex-col items-center p-6 transition hover:bg-base-300"
          >
            {#if vendor.logo_url}
              <img
                src={vendor.logo_url}
                alt={`${vendor.name} logo`}
                class="p-2 h-24 object-contain rounded-xl bg-base-300 mb-4"
              />
            {:else}
              <div
                class="h-20 w-20 rounded-xl bg-base-300 mb-4 flex items-center justify-center text-3xl text-primary font-bold"
              >
                {vendor.name?.charAt(0)}
              </div>
            {/if}
            <h2
              class="text-xl font-semibold mb-1 text-center flex items-center gap-2"
            >
              <span>{getFlagEmoji(vendor.country_iso)}</span>
              {vendor.name}
            </h2>
            <p class="text-gray-400 text-center mb-4 text-sm">
              {vendor.description}
            </p>
          </a>
        {/each}
      </div>
    </div>
  </section>
{:else if !vendorsAvailability}
  <FeatureDisabled featureName="The vendors explore page is" />
{:else if !databaseAvailability}
  <FeatureDisabled featureName="The database is" />
{/if}
