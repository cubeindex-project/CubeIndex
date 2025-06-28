<script lang="ts">
    import CubeCard from "$lib/components/cubeCard.svelte";
    import { writable, derived } from "svelte/store";

    // Props and loading
    let { data } = $props();
    let { cubes = [] } = data;

    // 1) Filter state (year is string 'All' or a year text)
    const selectedType = writable<string>("All");
    const selectedBrand = writable<string>("All");
    const WCALegal = writable<boolean | undefined>(undefined);
    const magnetic = writable<boolean | undefined>(undefined);
    const smart = writable<boolean | undefined>(undefined);
    const selectedYear = writable<string>("All");
    const modded = writable<boolean | undefined>(undefined);
    const stickered = writable<boolean | undefined>(undefined);
    const selectedCubeType = writable<string>("Base");

    const searchTerm = writable("");
    const currentPage = writable(1);
    const itemsPerPage = writable(12);

    // 2) Options
    const allTypes = Array.from(new Set(cubes.map((c) => c.type))).sort();
    const allBrands = Array.from(new Set(cubes.map((c) => c.brand))).sort();
    const allYears = Array.from(
        new Set(cubes.map((c) => new Date(c.release_date).getFullYear())),
    ).sort((a, b) => b - a);
    const allSubType = Array.from(new Set(cubes.map((c) => c.sub_type))).sort();
    const allCubeTypes = Array.from(
        new Set(cubes.map((c) => c.version_types)),
    ).sort();

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
            stickered,
            searchTerm,
        ],
        ([
            $type,
            $brand,
            $wca,
            $mag,
            $smart,
            $year,
            $modded,
            $stickered,
            $searchTerm,
        ]) => {
            return cubes
                .filter((c) => c.version_type === "Base")
                .filter((c) => c.approved === true)
                .filter((c) => {
                    const cubeYear = new Date(c.release_date).getFullYear();
                    return (
                        ($type === "All" || c.type === $type) &&
                        ($brand === "All" || c.brand === $brand) &&
                        ($wca === undefined || c.wca_legal === $wca) &&
                        ($mag === undefined || c.magnetic === $mag) &&
                        ($modded === undefined || c.modded === $modded) &&
                        ($stickered === undefined ||
                            c.stickered === $stickered) &&
                        ($smart === undefined || c.smart === $smart) &&
                        ($year === "All" || cubeYear === +$year)
                    );
                })
                .filter((c) => {
                    const name =
                        `${c.series ?? ""} ${c.model ?? ""}`.toLowerCase();
                    return name.includes($searchTerm.toLowerCase());
                });
        },
    );

    const paginatedCubes = derived(
        [filteredCubes, currentPage, itemsPerPage],
        ([$filteredCubes, $currentPage, $itemsPerPage]) => {
            const start = ($currentPage - 1) * $itemsPerPage;
            const end = start + $itemsPerPage;
            return $filteredCubes.slice(start, end);
        },
    );

    const totalPages = derived(
        [filteredCubes, itemsPerPage],
        ([$filteredCubes, $itemsPerPage]) =>
            Math.ceil($filteredCubes.length / $itemsPerPage),
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

    function goToPreviousPage() {
        if ($currentPage > 1) {
            currentPage.update((n) => n - 1);
        }
    }

    function goToNextPage() {
        if ($currentPage < $totalPages) {
            currentPage.update((n) => n + 1);
        }
    }

    $effect(() => {
        const _ = $filteredCubes;
        currentPage.set(1);
    });

    let showFilters = $state(false);
</script>

<section class="min-h-screenpx-6 py-16">
    <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-clash font-bold mb-6 text-center">
            Staff Explore Cubes
        </h1>
        <p class="mb-12 text-center">
            ⚠️ You're currently on the Staff Explore Page, not the public one.
            This section is for managing cubes, not browsing them like regular
            users. ⚠️
        </p>

        <!-- Search Bar + Toggle -->
        <div class="flex items-center mb-6">
            <button
                class="flex-shrink-0 h-12.5 px-4 rounded-l-xl cursor-pointer bg-base-200 border border-base-300 border-r-0 transition flex items-center"
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
                    placeholder="Search Your Cube"
                    bind:value={$searchTerm}
                    class="input w-full h-12.5 rounded-l-none border-base-300"
                />
                {#if $searchTerm.length}
                    <button
                        type="button"
                        class="absolute right-4 top-1/2 -translate-y-1/2 text-neutral cursor-pointer"
                        onclick={() => ($searchTerm = "")}
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
                        class="bg-base-200 border border-base-300 rounded-2xl p-6 sticky lg:top-24"
                    >
                        <div class="flex items-center justify-between mb-4">
                            <span class="font-semibold text-lg">Filters</span>
                        </div>
                        <div class="flex flex-col gap-4">
                            <!-- Type -->
                            <div>
                                <label class="block text-sm mb-1"
                                    >Type:
                                    <select
                                        bind:value={$selectedType}
                                        class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
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
                                        class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
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
                                        class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
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
                                        class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
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
                                        class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
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
                                        class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
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
                                        class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
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
                                    class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border cursor-pointer hover:bg-neutral hover:text-neutral-content"
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
                <div
                    class="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4"
                >
                    <div class="flex items-center">
                        <label class="text-sm mr-2" for="itemsPerPage"
                            >Cubes per page:</label
                        >
                        <select
                            id="itemsPerPage"
                            bind:value={$itemsPerPage}
                            class="px-7 py-2 rounded-lg bg-base-200 border border-base-300"
                            style="width:auto"
                        >
                            <option value={6}>6</option>
                            <option value={12}>12</option>
                            <option value={24}>24</option>
                            <option value={48}>48</option>
                            <option value={96}>96</option>
                        </select>
                    </div>

                    <div>
                        <a
                            href="/staff/cubes/add"
                            class="btn bg-primary text-primary-content"
                        >
                            <i class="fa-solid fa-plus"></i>
                            Add a Cube
                        </a>
                    </div>
                </div>

                {#await cubes}
                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {#each Array(6) as i}
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
                {:then}
                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {#each $paginatedCubes as cube}
                            <CubeCard
                                {cube}
                                add={false}
                                rate={false}
                                details={true}
                                badges={true}
                                image={true}
                                staff={true}
                            />
                        {/each}
                    </div>
                {/await}

                <div class="flex items-center justify-center gap-4 mt-10">
                    <div class="join">
                        <button
                            class="join-item btn btn-lg"
                            onclick={goToPreviousPage}
                            disabled={$currentPage === 1}
                            aria-label="Previous page"
                        >
                            <i class="fa-solid fa-chevron-left mr-2"></i>
                            Previous
                        </button>
                        <button class="join-item btn btn-lg">
                            Page {$currentPage} of {$totalPages}
                        </button>
                        <button
                            onclick={goToNextPage}
                            class="join-item btn btn-lg"
                            disabled={$currentPage === $totalPages}
                            aria-label="Next page"
                        >
                            Next
                            <i class="fa-solid fa-chevron-right ml-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
