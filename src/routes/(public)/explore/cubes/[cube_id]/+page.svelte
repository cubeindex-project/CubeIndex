<script lang="ts">
	let { data } = $props();
    let { cube } = $derived(data);
    let { vendor_links } = $derived(data);

    function formatReleaseDate(dateString: string): string {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    }

    const formattedReleaseDate = formatReleaseDate(cube.release_date)
</script>

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
            {cube.name}
        </h1>
        <p class="text-gray-400 mb-2">
            Brand: <span class="text-white">{cube.brand}</span>
        </p>
        <p class="text-gray-400 mb-2">
            Type: <span class="text-white">{cube.type}</span>
        </p>
        <p class="text-gray-400 mb-2">
            Release Date: <span class="text-white">{formattedReleaseDate}</span>
        </p>
        <p class="text-gray-400 mb-2">
            Rating: <span class="text-yellow-400 font-semibold"
                >⭐ {cube.rating}</span
            >
        </p>
        <p class="text-gray-400 mb-2">
            Magnetic: {cube.magnetic ? "✅" : "❌"}
        </p>
        <p class="text-gray-400 mb-2">
            Modded: {cube.modded ? "✅" : "❌"}
        </p>
        <p class="text-gray-400 mb-2">
            WCA Legal: {cube.wca_legal ? "✅" : "❌"}
        </p>
        {#if vendor_links}
            <div class="flex gap-2 items-center">
                <p class="text-gray-400 mb-2 items-center">Available at:</p>
                {#each vendor_links as shop}
                    <button
                        class="border border-white/20 hover:border-white/50 text-white font-medium px-4 py-2 rounded-xl transition duration-200 backdrop-blur-sm bg-white/5 hover:bg-white/10"
                    >
                        <a
                            href={shop.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {shop.vendor_name}
                        </a>
                    </button>
                {/each}
            </div>
        {/if}

        <a
            href="/explore/cubes"
            class="inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition"
        >
            ← Back to Explore
        </a>
    </div>
</section>
