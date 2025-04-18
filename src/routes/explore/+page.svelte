<script>
    import { onMount } from "svelte";
    export let data;
    const { cubes } = data;
    let loading = true;

    onMount(() => {
        loading = false;
    });
</script>

<section class="min-h-screen bg-black text-white px-6 py-16 relative">
    <!-- Background -->
    <div class="absolute inset-0 opacity-10">
        <img
            src="/images/hero-bg.png"
            alt=""
            class="w-full h-full object-cover"
        />
    </div>

    <div class="relative z-10 max-w-7xl mx-auto">
        <h1 class="text-4xl font-bold text-center mb-6">Explore Cubes</h1>
        <p class="text-center text-gray-400 mb-12">
            Browse all your favorite cubes by type, brand, or rating.
        </p>

        {#if loading}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {#each Array(6) as _, i}
                    <div
                        class="bg-neutral-800 rounded-2xl overflow-hidden animate-pulse"
                    >
                        <div class="h-48 bg-neutral-700"></div>
                        <div class="p-5 space-y-4">
                            <div class="h-6 bg-neutral-700 rounded w-3/4"></div>
                            <div class="h-4 bg-neutral-700 rounded w-1/2"></div>
                            <div class="h-4 bg-neutral-700 rounded w-1/4"></div>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {#each cubes as cube}
                    <div
                        class="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
                    >
                        <img
                            src={cube.image_url}
                            alt={cube.name}
                            class="w-full h-48 object-cover"
                        />
                        <div class="p-5">
                            <h2 class="text-xl font-bold mb-1">{cube.name}</h2>
                            <p class="text-sm text-gray-400">
                                {cube.brand} ・ {cube.type}
                            </p>
                            <div class="mt-3 text-sm text-yellow-400">
                                ⭐ {cube.rating}
                            </div>
                            <a
                                href={`/cube/${cube.name_id}`}
                                class="mt-4 inline-block text-blue-400 hover:underline"
                            >
                                View Details →
                            </a>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</section>
