<script>
    export let data;
    const { cube } = data;
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
            Release Year: <span class="text-white">{cube.release_year}</span>
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
            WCA Legal: {cube.wca_legal ? "✅" : "❌"}
        </p>
        {#if cube.where_to_buy}
            <div class="flex flex-row gap-2 items-center">
                <p class="text-gray-400 mb-2 items-center">Available at:</p>
                {#each cube.where_to_buy as shop}
                    <button class="bg-neutral-900 border-1 rounded-xl p-2 border-black">
                        <a href={shop.url}><p>{shop.label}</p></a>
                    </button>
                {/each}
            </div>
        {/if}

        <a
            href="/explore"
            class="inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition"
        >
            ← Back to Explore
        </a>
    </div>
</section>
