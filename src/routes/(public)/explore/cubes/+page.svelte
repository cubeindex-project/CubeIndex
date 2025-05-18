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

    let search = $state("");
    let showFilters = $state(false);
</script>

<section class="min-h-screen bg-black text-white px-6 py-16">
    <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-clash font-bold mb-6 text-center">
            Explore Cubes
        </h1>
        <p class="text-gray-400 mb-12 text-center">
            Browse all your favorite cubes by type, brand, or rating.
        </p>

        <!-- Search Bar + Toggle -->
        <div class="flex items-center mb-6">
            <button
                class="flex-shrink-0 h-12.5 px-4 rounded-l-xl cursor-pointer bg-neutral-900 border border-neutral-700 border-r-0 text-gray-300 hover:text-white hover:bg-neutral-800 transition flex items-center"
                aria-label="Toggle Filters"
                onclick={() => (showFilters = !showFilters)}
                type="button"
                style="border-top-right-radius:0; border-bottom-right-radius:0;"
            >
                <i class="fa-solid fa-sliders"></i>
            </button>
            <div class="relative flex-1">
                <input
                    type="text"
                    placeholder="Placeholder search bar"
                    bind:value={search}
                    class="w-full py-3 pl-12 pr-4 rounded-r-xl bg-neutral-900 border border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
                    style="border-top-left-radius:0; border-bottom-left-radius:0;"
                />
                <span
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                >
                    <i class="fa-solid fa-magnifying-glass"></i>
                </span>
                {#if search}
                    <button
                        type="button"
                        class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        onclick={() => (search = "")}
                        aria-label="Clear"
                    >
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                {/if}
            </div>
        </div>

        <div class="flex flex-col lg:flex-row gap-8">
            <!-- Filters Sidebar -->
            {#if showFilters}
                <aside class="w-full lg:w-64">
                    <div
                        class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sticky lg:top-24"
                    >
                        <div class="flex items-center justify-between mb-4">
                            <span class="font-semibold text-lg">Filters</span>
                            <button
                                class="lg:hidden text-gray-400 hover:text-white"
                                aria-label="Close Filters"
                                onclick={() => (showFilters = false)}
                            >
                                <i class="fa-solid fa-xmark fa-lg"></i>
                            </button>
                        </div>
                        <div class="flex flex-col gap-4">
                            <!-- Type -->
                            <div>
                                <label class="block text-sm mb-1"
                                    >Type:
                                    <select
                                        bind:value={$selectedType}
                                        class="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700"
                                    >
                                        <option>All</option>
                                        {#each allTypes as t}
                                            <option>{t}</option>
                                        {/each}
                                    </select>
                                </label>
                            </div>
                            <!-- Brand -->
                            <div>
                                <label class="block text-sm mb-1"
                                    >Brand:
                                    <select
                                        bind:value={$selectedBrand}
                                        class="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700"
                                    >
                                        <option>All</option>
                                        {#each allBrands as b}
                                            <option>{b}</option>
                                        {/each}
                                    </select></label
                                >
                            </div>
                            <!-- WCA Legal -->
                            <div>
                                <label class="block text-sm mb-1"
                                    >WCA Legal:
                                    <select
                                        bind:value={$WCALegal}
                                        class="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700"
                                    >
                                        <option value={undefined}>All</option>
                                        <option value={true}>True</option>
                                        <option value={false}>False</option>
                                    </select>
                                </label>
                            </div>
                            <!-- Magnetic -->
                            <div>
                                <label class="block text-sm mb-1"
                                    >Magnetic:
                                    <select
                                        bind:value={$magnetic}
                                        class="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700"
                                    >
                                        <option value={undefined}>All</option>
                                        <option value={true}>True</option>
                                        <option value={false}>False</option>
                                    </select>
                                </label>
                            </div>
                            <!-- Smart -->
                            <div>
                                <label class="block text-sm mb-1"
                                    >Smart:
                                    <select
                                        bind:value={$smart}
                                        class="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700"
                                    >
                                        <option value={undefined}>All</option>
                                        <option value={true}>True</option>
                                        <option value={false}>False</option>
                                    </select>
                                </label>
                            </div>
                            <!-- Modded -->
                            <div>
                                <label class="block text-sm mb-1"
                                    >Modded:
                                    <select
                                        bind:value={$modded}
                                        class="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700"
                                    >
                                        <option value={undefined}>All</option>
                                        <option value={true}>True</option>
                                        <option value={false}>False</option>
                                    </select>
                                </label>
                            </div>
                            <!-- Release Year -->
                            <div>
                                <label class="block text-sm mb-1"
                                    >Release Year:
                                    <select
                                        bind:value={$selectedYear}
                                        class="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700"
                                    >
                                        <option>All</option>
                                        {#each allYears as year}
                                            <option value={year}>{year}</option>
                                        {/each}
                                    </select>
                                </label>
                            </div>
                            <!-- Reset -->
                            <div>
                                <button
                                    class="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition cursor-pointer"
                                    onclick={resetFilters}
                                    type="button"
                                >
                                    <i
                                        class="fa-solid fa-arrow-rotate-left mr-2"
                                    ></i>
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
            {/if}

            <!-- Cube Cards Grid -->
            <div class="flex-1">
                {#if loading}
                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {#each Array(6) as _, i}
                            <div
                                class="bg-neutral-800 rounded-2xl overflow-hidden animate-pulse"
                            >
                                <div class="h-48 bg-neutral-700"></div>
                                <div class="p-5 space-y-4">
                                    <div
                                        class="h-6 bg-neutral-700 rounded w-3/4"
                                    ></div>
                                    <div
                                        class="h-4 bg-neutral-700 rounded w-1/2"
                                    ></div>
                                    <div
                                        class="h-4 bg-neutral-700 rounded w-1/4"
                                    ></div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
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
                                    <h2 class="text-xl font-bold mb-1">
                                        {cube.name}
                                    </h2>
                                    <p class="text-sm text-gray-400">
                                        {cube.brand} ・ {cube.type}
                                    </p>
                                    <div class="mt-3 text-sm text-yellow-400">
                                        ⭐ {cube.rating}
                                    </div>
                                    <a
                                        href={`/explore/cubes/${cube.name_id}`}
                                        class="mt-4 inline-block text-blue-400 hover:underline"
                                        >View Details →</a
                                    >
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}

                <div class="text-center mt-8 text-lg text-gray-300">
                    Showing {$filteredCubes.length} cube{$filteredCubes.length ===
                    1
                        ? ""
                        : "s"}
                </div>
            </div>
        </div>
    </div>
</section>
