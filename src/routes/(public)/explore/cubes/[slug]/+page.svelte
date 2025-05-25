<script lang="ts">
    import { configCatClient } from "$lib/configcatClient";
    import FeatureDisabled from "$lib/components/featureDisabled.svelte";
    import { onMount } from "svelte";

    let { data } = $props();
    let { cube } = $derived(data);
    let { vendor_links } = $derived(data);
    let databaseAvailability: boolean = $state(true);

    function formatReleaseDate(dateString: string): string {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    }

    const formattedReleaseDate = formatReleaseDate(cube.release_date);

    onMount(() =>
        configCatClient.getValueAsync("database", false).then((value) => {
            databaseAvailability = value;
        }),
    );
</script>

{#if databaseAvailability}
    <section class="min-h-screen bg-black text-white px-6 py-16">
        <div class="max-w-4xl mx-auto">
            {#if cube.image_url}
                <div class="my-6">
                    <img
                        src={cube.image_url}
                        alt={cube.name}
                        class="rounded-2xl bg-neutral-900 p-4 my-4 border border-neutral-700 object-contain w-full max-w-md max-h-96"
                    />
                </div>
            {/if}
            <h1 class="text-4xl font-clash font-bold text-white mb-4">
                {cube.series}
                {cube.model}
            </h1>
            <div
                class="mb-4 p-4 bg-neutral-900 rounded-xl border border-neutral-800 shadow-sm"
            >
                <p class="text-gray-300 leading-relaxed">
                    Description:
                    <span class="block mt-2 text-white">
                        The <span class="font-bold text-blue-400"
                            >{cube.series} {cube.model}</span
                        >
                        is a
                        <span class="font-bold text-blue-400">{cube.type}</span>
                        twisty puzzle released on
                        <span class="font-bold text-blue-400"
                            >{formattedReleaseDate}</span
                        >. It is
                        <span class="font-bold text-blue-400"
                            >{cube.magnetic ? "magnetic" : "non-magnetic"}</span
                        >,
                        <span class="font-bold text-blue-400"
                            >{cube.smart ? "smart" : "non-smart"}</span
                        >, and
                        <span class="font-bold text-blue-400"
                            >{cube.wca_legal
                                ? "WCA-legal"
                                : "not WCA-legal"}</span
                        >. Currently, it is
                        <span class="font-bold text-blue-400"
                            >{cube.discontinued
                                ? "discontinued"
                                : "available"}</span
                        >, has a community rating of
                        <span class="font-bold text-blue-400"
                            >{cube.rating}/5</span
                        >, and is
                        <span class="font-bold text-blue-400"
                            >{cube.modded ? "modded" : "original"}</span
                        >.
                    </span>
                </p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <div
                    class="bg-neutral-900 rounded-xl p-4 flex flex-col gap-2 border border-neutral-800"
                >
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Brand:</span>
                        <span class="text-white font-medium">{cube.brand}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Type:</span>
                        <span class="text-white font-medium">{cube.type}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Weight:</span>
                        <span class="text-white font-medium"
                            >{cube.weight} g</span
                        >
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Release Date:</span>
                        <span class="text-white font-medium"
                            >{formattedReleaseDate}</span
                        >
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Rating:</span>
                        <span class="text-yellow-400 font-semibold"
                            >⭐ {cube.rating}</span
                        >
                    </div>
                </div>
                <div
                    class="bg-neutral-900 rounded-xl p-4 flex flex-col gap-2 border border-neutral-800"
                >
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Smart:</span>
                        <span class="text-xl">{cube.smart ? "✅" : "❌"}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Magnetic:</span>
                        <span class="text-xl"
                            >{cube.magnetic ? "✅" : "❌"}</span
                        >
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Modded:</span>
                        <span class="text-xl">{cube.modded ? "✅" : "❌"}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">WCA Legal:</span>
                        <span class="text-xl"
                            >{cube.wca_legal ? "✅" : "❌"}</span
                        >
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Maglev:</span>
                        <span class="text-xl">{cube.maglev ? "✅" : "❌"}</span>
                    </div>
                </div>
            </div>
            {#if vendor_links && vendor_links.length > 0}
                <div class="my-8">
                    <h2
                        class="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2"
                    >
                        <i class="fa-solid fa-cart-shopping"></i>
                        Available at:
                    </h2>
                    <div class="flex flex-wrap gap-3">
                        {#each vendor_links as shop}
                            <a
                                href={shop.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="flex items-center gap-2 border border-blue-500/30 hover:border-blue-400 text-white font-medium px-4 py-2 rounded-xl transition duration-200 bg-blue-500/10 hover:bg-blue-500/20 shadow-sm hover:shadow-lg"
                            >
                                <i class="fa-solid fa-check"></i>
                                {shop.vendor_name}
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}

            <div class="mt-4">
                <a
                    href="https://discord.gg/76ExrEAE7s"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition"
                >
                    🚩 Report incorrect data
                </a>
            </div>

            <a
                href="/explore/cubes"
                class="inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition"
            >
                ← Back to Explore
            </a>
        </div>
    </section>
{:else}
    <FeatureDisabled featureName="The database is" />
{/if}
