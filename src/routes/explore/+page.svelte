<script>
    import { onMount } from "svelte";
    export let data;
    let loading = true;

    const { cubes } = data;
    loading = false;
</script>

<section
    class="min-h-screen bg-black text-white px-6 py-16 relative flex items-center justify-center"
>
    <!-- Background Image -->
    <div class="absolute inset-0 opacity-10 z-0">
        <img
            src="/images/hero-bg.png"
            alt=""
            class="w-full h-full object-cover"
        />
    </div>

    <div class="z-10 w-full max-w-7xl">
        <h1 class="text-4xl font-bold mb-6 text-white text-center">
            Explore Cubes
        </h1>
        <p class="text-center text-gray-400 mb-12">
            Browse all your favorite cubes by type, brand, or rating.
        </p>
        <!-- Content -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {#each cubes as cube}
                <div
                    class="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition group"
                >
                    <img
                        src={cube.image_url}
                        alt={cube.name}
                        class="w-full h-48 object-cover"
                    />

                    <div class="p-5">
                        <h2 class="text-xl font-bold mb-1 text-white">
                            {cube.name}
                        </h2>
                        <p class="text-sm text-gray-400">
                            {cube.brand} ・ {cube.type}
                        </p>
                        <p class="text-sm text-gray-400">
                            Released in : {cube.release_year}
                        </p>
                        <div class="mt-3 items-center text-sm text-yellow-400">
                            ⭐ {cube.rating}
                        </div>
                        <a
                            href={`/cube/${cube.id}`}
                            class="inline-block mt-4 text-blue-400 hover:underline"
                        >
                            View Details →
                        </a>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</section>
