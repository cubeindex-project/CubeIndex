<script lang="ts">
    import { configCatClient } from "$lib/configcatClient";
    import FeatureDisabled from "$lib/components/featureDisabled.svelte";
    import { onMount } from "svelte";

    let { data } = $props();
    const { accessories } = data;
    let databaseAvailability: boolean = $state(true);

    // Helper to format YYYY-MM-DD
    function formatDate(d: string) {
        return new Date(d).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    onMount(() =>
        configCatClient.getValueAsync("database", false).then((value) => {
            databaseAvailability = value;
        }),
    );
</script>

{#if databaseAvailability}
    <section class="min-h-screen bg-black text-white px-6 py-16 relative">
        <div class="relative z-10 max-w-7xl mx-auto">
            <h1 class="text-4xl font-bold mb-6 font-clash text-center">
                Explore Accessories
            </h1>
            <p class="text-gray-400 mb-12 text-center">
                Discover the best cube timers, mats, lubricants, and
                more—handpicked by our community.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {#each accessories as acc}
                    <div
                        class="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
                    >
                        <img
                            src={acc.image_url ??
                                "/images/placeholder-accessory.png"}
                            alt={acc.name}
                            class="w-full h-48 object-cover"
                        />
                        <div class="p-5 space-y-2">
                            <h2 class="text-xl font-bold">{acc.name}</h2>
                            <p class="text-sm text-gray-400">
                                {acc.brand} ・ {acc.category}
                            </p>
                            {#if acc.compatibility}
                                <p class="text-sm">
                                    <strong>Compatibility:</strong>
                                    {acc.compatibility}
                                </p>
                            {/if}
                            <div class="text-sm text-yellow-400">
                                ⭐ {acc.rating}
                            </div>
                            <p class="text-sm text-gray-500">
                                Released: {formatDate(acc.release_date)}
                            </p>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </section>
{:else}
    <FeatureDisabled featureName="The database is" />
{/if}
