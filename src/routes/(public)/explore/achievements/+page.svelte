<script lang="ts">
  import Pagination from "$lib/components/misc/pagination.svelte";
  import SearchBar from "$lib/components/misc/searchBar.svelte";
  import FilterSidebar from "$lib/components/misc/filterSidebar.svelte";
  import ItemsPerPageSelector from "$lib/components/misc/itemsPerPageSelector.svelte";
  import TriStateCheckbox from "$lib/components/misc/triStateCheckbox.svelte";
  import type { SortFieldOption } from "$lib/components/misc/sortSelector.svelte";
  import SortSelector from "$lib/components/misc/sortSelector.svelte";

  const { data } = $props();
  const { achievements, currentUserAchi } = data;

  // Centralize styling by rarity for maintainability
  const rarityStyles: Record<
    string,
    { bar: string; badge: string; badgeText?: string }
  > = {
    Special: {
      bar: "bg-gradient-to-b from-yellow-400 via-pink-500 to-purple-600",
      badge:
        "bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-neutral-900",
    },
    Mythic: {
      bar: "bg-red-600",
      badge: "bg-red-600 text-white",
    },
    Legendary: {
      bar: "bg-yellow-400",
      badge: "bg-yellow-400 text-neutral-900",
    },
    Exotic: {
      bar: "bg-teal-400",
      badge: "bg-teal-400 text-neutral-900",
    },
    Epic: {
      bar: "bg-purple-600",
      badge: "bg-purple-600 text-white",
    },
    Rare: {
      bar: "bg-blue-600",
      badge: "bg-blue-600 text-white",
    },
    Uncommon: {
      bar: "bg-green-600",
      badge: "bg-green-600 text-white",
    },
    Common: {
      bar: "bg-neutral-700",
      badge: "bg-neutral-700 text-white",
    },
    Unknown: {
      bar: "bg-base-300",
      badge: "bg-base-300 text-neutral-900",
    },
  };

  function getRarityStyle(rarity?: string) {
    return rarityStyles[rarity ?? "Common"] ?? rarityStyles.Common;
  }

  function pct(n: number | null | undefined) {
    const v = Number.isFinite(n as number) ? Number(n) : 0;
    return Math.max(0, Math.min(100, v));
  }

  let showFilters = $state(false);

  let allRarities: string[] = $state([]);

  function calcAll() {
    const Rarities = Array.from(
      new Set(achievements.map((c) => c.rarity))
    ).sort();

    allRarities = Rarities;
  }

  let selectedRarity: string = $state("All");
  let hidden: boolean | undefined = $state(undefined);
  let obtainable: boolean | undefined = $state(undefined);

  let searchTerm: string = $state(""); // Text input for search bar

  const filteredAchi = $derived.by(() => {
    return achievements.filter((a) => {
      const lowerName = a.name.toLowerCase();
      return (
        lowerName.includes(searchTerm.toLowerCase()) &&
        (obtainable === undefined || a.unlockable === obtainable) &&
        (hidden === undefined || a.hidden === hidden) &&
        (selectedRarity === "All" || a.rarity === selectedRarity)
      );
    });
  });

  let sortField: string = $state("name"); // Field to sort by
  let sortOrder: "asc" | "desc" = $state("asc"); // Sort direction
  const sortFields: SortFieldOption[] = [
    { value: "date", label: "Recent" },
    { value: "name", label: "Name" },
    { value: "unlock-rate", label: "Unlock Rate" },
  ];

  const sortedAchi = $derived.by(() => {
    const arr = filteredAchi.slice();
    arr.sort((a, b) => {
      let av: any;
      let bv: any;
      switch (sortField) {
        case "unlock-rate":
          av = a.rarity_percent ?? 0;
          bv = b.rarity_percent ?? 0;
          break;
        case "name":
          av = a.name;
          bv = b.name;
          return sortOrder === "asc"
            ? av.localeCompare(bv, undefined, {
                numeric: true,
                sensitivity: "base",
                ignorePunctuation: true,
              })
            : bv.localeCompare(av, undefined, {
                numeric: true,
                sensitivity: "base",
                ignorePunctuation: true,
              });
        default:
          av = new Date(a.created_at).getTime();
          bv = new Date(b.created_at).getTime();
      }
      if (av < bv) return sortOrder === "asc" ? -1 : 1;
      if (av > bv) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  });

  let itemsPerPage: number = $state(6); // Items shown per page
  let currentPage: number = $state(1); // Current pagination page

  const paginatedAchi = $derived.by(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedAchi.slice(start, end);
  });

  // Calculate total pages for pagination
  const totalPages = $derived(Math.max(Math.ceil(sortedAchi.length / itemsPerPage)));

  $effect(() => {
    const _ = sortedAchi;
    currentPage = 1;
  });

  $effect(() => {
    const _ = sortedAchi;
    calcAll();
  });

  function resetFilters() {
    selectedRarity = "All";
    hidden = undefined;
    obtainable = undefined;
  }
</script>

<svelte:head>
  <title>Achievements - CubeIndex</title>
</svelte:head>

{#snippet filterContents()}
  <div>
    <label class="block text-sm mb-1">
      Rarity:
      <select
        bind:value={selectedRarity}
        class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
      >
        <option>All</option>
        {#each allRarities as r}
          <option>{r}</option>
        {/each}
      </select>
    </label>
  </div>
  <TriStateCheckbox bind:value={obtainable} label="Obtainable" />
  <TriStateCheckbox bind:value={hidden} label="Hidden" />
  <div>
    <button
      class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border cursor-pointer hover:bg-neutral hover:text-neutral-content"
      onclick={resetFilters}
      type="button"
    >
      <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
      Reset Filters
    </button>
  </div>
{/snippet}
  <section class="min-h-screen px-6 py-20 md:py-24">
    <div class="max-w-7xl mx-auto">
      <header class="mb-10 text-center">
        <h1
          class="text-3xl md:text-4xl font-clash font-extrabold tracking-tight"
        >
          Achievements
        </h1>
        <p class="mt-3 text-base-content max-w-2xl mx-auto">
          Unlock achievements by participating in the CubeIndex community.
          Collect them all to showcase your journey.
        </p>
      </header>

      <SearchBar
        bind:searchTerm
        showFilter={true}
        filterAction={() => (showFilters = !showFilters)}
        placeholderLabel="Search Achievements"
      />
      <div class="flex flex-col lg:flex-row gap-8">
        <FilterSidebar {showFilters}>
          {@render filterContents()}
        </FilterSidebar>

        <div class="flex-1">
          <!-- Controls: items per page & sorting -->
          <div
            class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4"
          >
            <div class="flex flex-wrap items-center gap-4">
              <ItemsPerPageSelector bind:itemsPerPage label="Achievements per page" />
              <SortSelector bind:sortField bind:sortOrder fields={sortFields} />
            </div>
          </div>

          <div class="mb-10">
            <Pagination bind:currentPage {totalPages} />
          </div>

          <!-- Cards Grid -->
          <div
            class="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {#each paginatedAchi as achievement (achievement.name)}
              {#key achievement.name}
                {@const isUnlocked = currentUserAchi.find(
                  (cua) => cua.achievement_slug === achievement.slug
                )}
                {@const value = pct(achievement.rarity_percent)}
                {@const r = 16}
                {@const c = 2 * Math.PI * r}
                {@const isHidden = !isUnlocked && achievement.hidden === true}

                <div
                  class={"group relative overflow-hidden rounded-2xl border border-base-300 bg-base-200 shadow-sm ring-1 ring-transparent transition " +
                    "focus-within:ring-2 focus-within:ring-accent " +
                    (!isUnlocked ? "opacity-95 grayscale-[18%]" : "")}
                  aria-label={`Achievement: ${achievement.name}`}
                >
                  <!-- Rarity Accent Bar -->
                  <div
                    class={"absolute left-0 top-0 h-full w-1.5 " +
                      getRarityStyle(isHidden ? "Unknown" : achievement.rarity)
                        .bar}
                  ></div>

                  <!-- Card Body -->
                  <div
                    class="relative flex h-full flex-col p-5 md:p-6 pl-6 md:pl-7"
                  >
                    <!-- HEADER -->
                    <div class="mb-3 flex items-start justify-between gap-4">
                      <div class="flex items-start gap-3">
                        <div
                          class="relative inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-base-300 text-3xl leading-none ring-1 ring-base-300/70 select-none"
                          aria-hidden="true"
                        >
                          <!-- Halo + ring only when unlocked -->
                          {#if isUnlocked}
                            <span
                              class="pointer-events-none absolute -inset-1 rounded-[14px] bg-success/20 blur-md"
                            ></span>
                            <span
                              class="pointer-events-none absolute inset-0 rounded-[12px] ring-2 ring-success/35"
                            ></span>
                          {/if}

                          <!-- Emoji: grayscale only when NOT unlocked -->
                          <span
                            class={!isUnlocked
                              ? "text-[26px] leading-none filter grayscale"
                              : "text-[26px] leading-none"}
                          >
                            {achievement.icon}
                          </span>
                        </div>
                        <div>
                          <h2 class="text-lg md:text-xl font-bold leading-snug">
                            {#if isHidden}
                              Hidden
                            {:else}
                              {achievement.name}
                            {/if}
                          </h2>
                          <p
                            class="mt-1 text-sm text-base-content/70 line-clamp-3"
                          >
                            {#if isHidden}
                              Unlock this achievement to reveal its name and
                              description.
                            {:else}
                              {achievement.description}
                            {/if}
                          </p>
                        </div>
                      </div>

                      <!-- Rarity badge (flow element, not absolute) -->
                      {#if isHidden}
                        <span
                          class="inline-flex flex-shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 ring-black/5 select-none bg-base-300 text-base-content/70"
                          title="This achievement is hidden"
                        >
                          Hidden
                        </span>
                      {:else}
                        <span
                          class={"inline-flex flex-shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 ring-black/5 select-none " +
                            getRarityStyle(achievement.rarity).badge}
                          title={`Rarity: ${achievement.rarity}`}
                        >
                          {achievement.rarity}
                        </span>
                      {/if}
                    </div>

                    <!-- TITLE REWARD -->
                    {#if achievement.title}
                      <div
                        class="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent ring-1 ring-accent/20"
                      >
                        <i class="fa-regular fa-star" aria-hidden="true"></i>
                        <span class="opacity-80">Title reward:</span>
                        <span class="font-semibold text-accent"
                          >“{achievement.title}”</span
                        >
                      </div>
                    {/if}

                    <!-- Spacer to keep consistent heights -->
                    <div class="flex-1"></div>

                    <!-- META (status included in-flow) -->
                    <dl class="mt-5 grid grid-cols-1 gap-2 text-sm">
                      {#if achievement.category}
                        <div class="flex items-start justify-between gap-3">
                          <dt class="text-base-content/60">Category</dt>
                          <dd class="font-medium text-right">
                            {achievement.category}
                          </dd>
                        </div>
                      {/if}

                      <div class="flex items-start justify-between gap-3">
                        <dt class="text-base-content/60">Unlock Method</dt>
                        <dd class="font-medium text-right">
                          {achievement.unlock_method}
                        </dd>
                      </div>

                      <div
                        class="flex flex-col items-start justify-between gap-3"
                      >
                        <dt class="text-base-content/60">Claimed by</dt>
                        <dd class="w-full max-w-[18rem]">
                          <div class="flex items-center gap-3">
                            <!-- Micro donut -->
                            <svg
                              class="h-9 w-9 flex-shrink-0"
                              viewBox="0 0 40 40"
                              role="img"
                              aria-label={`Claimed by ${value.toFixed(2)}% of users`}
                            >
                              <!-- track -->
                              <circle
                                cx="20"
                                cy="20"
                                {r}
                                fill="none"
                                stroke="currentColor"
                                stroke-opacity="0.15"
                                stroke-width="6"
                              />
                              <!-- progress -->
                              <circle
                                cx="20"
                                cy="20"
                                {r}
                                fill="none"
                                stroke-width="6"
                                stroke-linecap="round"
                                class={getRarityStyle(achievement.rarity).bar +
                                  " [stroke:currentColor] [paint-order:stroke] " +
                                  (isUnlocked
                                    ? "drop-shadow-[0_0_6px_rgba(0,0,0,0.2)]"
                                    : "")}
                                style={`--p:${value};`}
                                stroke-dasharray={c}
                                stroke-dashoffset={c - (value / 100) * c}
                                transform="rotate(-90 20 20)"
                              />
                              <!-- center label -->
                              <text
                                x="50%"
                                y="50%"
                                dominant-baseline="middle"
                                text-anchor="middle"
                                class="text-[9px] fill-current"
                              >
                                {Math.round(value)}%
                              </text>
                            </svg>

                            <!-- Progress bar with milestones -->
                            <div class="flex-1">
                              <div
                                class="relative h-2.5 w-full overflow-hidden rounded-full bg-base-300 ring-1 ring-base-300/60"
                                role="progressbar"
                                aria-valuemin="0"
                                aria-valuemax="100"
                                aria-valuenow={value}
                                title={`${value.toFixed(2)}% of users`}
                              >
                                <!-- filled -->
                                <div
                                  class={"h-full " +
                                    getRarityStyle(achievement.rarity).bar +
                                    " transition-[width] duration-700 ease-out"}
                                  style={`width:${value}%;`}
                                ></div>
                                <!-- milestone ticks -->
                                {#each [1, 5, 20, 50] as m}
                                  <span
                                    class="pointer-events-none absolute top-0 h-full w-[2px] bg-base-100/70 opacity-70"
                                    style={`left: calc(${m}% - 1px);`}
                                    aria-hidden="true"
                                  ></span>
                                {/each}
                              </div>
                              <div
                                class="mt-1 flex justify-between text-[10px] leading-none text-base-content/60"
                              >
                                <span>0%</span>
                                <span>25%</span>
                                <span>50%</span>
                                <span>75%</span>
                                <span>100%</span>
                              </div>
                            </div>
                          </div>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {#if !achievement.unlockable}
                    <!-- Not unlockable: desaturated overlay, diagonal micro stripes, lock stamp -->
                    <div class="pointer-events-none absolute inset-0 z-20">
                      <!-- dim background -->
                      <div
                        class="absolute inset-0 bg-base-200/70 backdrop-blur-none"
                      ></div>

                      <!-- diagonal stripes -->
                      <div
                        class="absolute inset-0 opacity-60 [background:repeating-linear-gradient(135deg,rgba(0,0,0,0.05)_0_10px,transparent_10px_20px)]"
                      ></div>

                      <!-- lock stamp -->
                      <div class="absolute inset-0 grid place-items-center">
                        <div
                          class="flex items-center gap-2 rounded-full bg-base-100/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-error ring-1 ring-error/20 backdrop-blur-sm"
                        >
                          <i class="fa-solid fa-lock" aria-hidden="true"></i>
                          Not currently unlockable
                        </div>
                      </div>

                      <!-- thin error ring -->
                      <div
                        class="absolute -inset-[1px] rounded-2xl ring-2 ring-error/25"
                      ></div>
                    </div>
                  {/if}

                  <!-- Hover/focus flourish -->
                  <div
                    class="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-accent/0 transition-all duration-200 group-hover:ring-1 group-hover:ring-accent/30"
                    aria-hidden="true"
                  ></div>
                </div>
              {/key}
            {:else}
              <!-- No results state -->
              <div
                class="col-span-full flex flex-col items-center justify-center py-20"
              >
                <i class="fa-solid fa-trophy fa-3x mb-4"></i>
                <h2 class="text-2xl font-semibold mb-2">
                  No achievements found
                </h2>
                <p class="mb-6 text-center max-w-xs">
                  We couldn't find any achievements matching your search or
                  filters. Try adjusting them or resetting to see everything.
                </p>
                <button
                  onclick={() => {
                    // resetFilters();
                    searchTerm = "";
                  }}
                  class="btn btn-outline flex items-center"
                  aria-label="Reset filters"
                >
                  <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
                  Reset
                </button>
              </div>
            {/each}
          </div>

          {#if !achievements || achievements.length === 0}
            <div class="mt-16 text-center">
              <div
                class="mx-auto mb-4 h-16 w-16 rounded-2xl bg-base-200 ring-1 ring-base-300 flex items-center justify-center text-3xl"
              >
                🏆
              </div>
              <h3 class="text-xl font-semibold">No achievements yet</h3>
            </div>
          {/if}

          <div class="mt-10">
            <Pagination bind:currentPage {totalPages} />
          </div>
        </div>
      </div>
    </div>
  </section>