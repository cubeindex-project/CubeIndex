<script lang="ts">
    import { onMount } from "svelte";
    import { writable, derived } from "svelte/store";

    // Props and loading
    let { data } = $props();
    const { cubes } = data;
    let loading = $state(true);

    // 1) Filter state (year is string 'All' or a year text)
    const selectedType = writable<string>("All");
    const selectedBrand = writable<string>("All");
    const WCALegal = writable<boolean | undefined>(undefined);
    const magnetic = writable<boolean | undefined>(undefined);
    const smart = writable<boolean | undefined>(undefined);
    const selectedYear = writable<string>("All");
    const modded = writable<boolean | undefined>(undefined);

    // 2) Options
    const allTypes = Array.from(new Set(cubes.map((c) => c.type))).sort();
    const allBrands = Array.from(new Set(cubes.map((c) => c.brand))).sort();
    const allYears = Array.from(new Set(cubes.map((c) => c.release_year))).sort(
        (a, b) => Number(b) - Number(a),
    );

    // 3) Reactive filtered list
    const filteredCubes = derived(
        [
            selectedType,
            selectedBrand,
            WCALegal,
            magnetic,
            smart,
            selectedYear,
            modded,
        ],
        ([$type, $brand, $wca, $mag, $smart, $year, $modded]) => {
            return cubes.filter((c) => {
                // only apply year check when a specific year is picked
                const yearCheck = $year === "All" || c.release_year === $year;

                return (
                    ($type === "All" || c.type === $type) &&
                    ($brand === "All" || c.brand === $brand) &&
                    ($wca === undefined || c.wca_legal === $wca) &&
                    ($mag === undefined || c.magnetic === $mag) &&
                    ($modded === undefined || c.modded === $modded) &&
                    ($smart === undefined || c.smart === $smart) &&
                    yearCheck
                );
            });
        },
    );

    function resetFilters() {
        selectedType.set("All");
        selectedBrand.set("All");
        WCALegal.set(undefined);
        magnetic.set(undefined);
        smart.set(undefined);
        selectedYear.set("All");
        modded.set(undefined);
    }

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
        <h1 class="text-4xl font-bold text-center mb-6 font-clash">
            Explore Cubes
        </h1>
        <p class="text-center text-gray-400 mb-12">
            Browse all your favorite cubes by type, brand, or rating.
        </p>

        <!-- Filter Bar -->
        <div
            class="flex flex-col sm:flex-row gap-4 items-center justify-center mb-12"
        >
            <!-- Type Filter -->
            <div class="flex flex-col gap-2">
                <label for="selectedType" class="text-sm">Type:</label>
                <select
                    bind:value={$selectedType}
                    class="px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 cursor-pointer"
                >
                    <option>All</option>
                    {#each allTypes as t}
                        <option>{t}</option>
                    {/each}
                </select>
            </div>

            <!-- Brand Filter -->
            <div class="flex flex-col gap-2">
                <label for="selectedBrand" class="text-sm">Brand:</label>
                <select
                    bind:value={$selectedBrand}
                    class="px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 cursor-pointer"
                >
                    <option>All</option>
                    {#each allBrands as b}
                        <option>{b}</option>
                    {/each}
                </select>
            </div>

            <!-- WCA Legal Filter -->
            <div class="flex flex-col gap-2">
                <label for="WCALegal" class="text-sm">WCA Legal:</label>
                <select
                    bind:value={$WCALegal}
                    class="w-30 px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 cursor-pointer"
                >
                    <option value={undefined}>All</option>
                    <option value={true}>True</option>
                    <option value={false}>False</option>
                </select>
            </div>

            <!-- Magnetic Filter -->
            <div class="flex flex-col gap-2">
                <label for="magnetic" class="text-sm">Magnetic:</label>
                <select
                    bind:value={$magnetic}
                    class="w-30 px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 cursor-pointer"
                >
                    <option value={undefined}>All</option>
                    <option value={true}>True</option>
                    <option value={false}>False</option>
                </select>
            </div>

            <!-- Smart Filter -->
            <div class="flex flex-col gap-2">
                <label for="smart" class="text-sm">Smart:</label>
                <select
                    bind:value={$smart}
                    class="w-30 px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 cursor-pointer"
                >
                    <option value={undefined}>All</option>
                    <option value={true}>True</option>
                    <option value={false}>False</option>
                </select>
            </div>

            <!-- Modded Filter -->
            <div class="flex flex-col gap-2">
                <label for="modded" class="text-sm">Modded:</label>
                <select
                    bind:value={$modded}
                    class="w-30 px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 cursor-pointer"
                >
                    <option value={undefined}>All</option>
                    <option value={true}>True</option>
                    <option value={false}>False</option>
                </select>
            </div>

            <!-- Release Year -->
            <div class="flex flex-col gap-2">
                <label for="selectedYear" class="text-sm">Release Year:</label>
                <select
                    bind:value={$selectedYear}
                    class="w-32 px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 cursor-pointer"
                >
                    <option value="All">All</option>
                    {#each allYears as year}
                        <option value={year}>{year}</option>
                    {/each}
                </select>
            </div>

            <div class="flex flex-col gap-2">
                <label for="resetFilters" class="text-sm opacity-0 select-none">Reset</label>
                <button
                    class="cursor-pointer px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition flex items-center justify-center"
                    aria-label="Reset Filters"
                    onclick={resetFilters}
                >
                    <i class="fa-solid fa-arrow-rotate-left fa-2x text-gray-300 hover:text-white transition"></i>
                </button>
            </div>
        </div>

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
                {#each $filteredCubes as cube}
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
                                href={`/explore/${cube.name_id}`}
                                class="mt-4 inline-block text-blue-400 hover:underline"
                            >
                                View Details →
                            </a>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}

        <div class="text-center m-8 text-lg text-gray-300">
            Showing {$filteredCubes.length} cube{$filteredCubes.length === 1
                ? ""
                : "s"}
        </div>
    </div>
</section>
