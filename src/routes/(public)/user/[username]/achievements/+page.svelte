<script lang="ts">
  import type { PageData } from "./$types";
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte";
  import SearchBar from "$lib/components/misc/searchBar.svelte";
  import FilterSidebar from "$lib/components/misc/filterSidebar.svelte";
  import Pagination from "$lib/components/misc/pagination.svelte";
  import SortSelector from "$lib/components/misc/sortSelector.svelte";

  let { data }: { data: PageData } = $props();
  const { user_achievements = [], profile } = data;

  // Search, filters, sort, pagination
  let searchTerm: string = $state("");
  let showFilters = $state(false);
  let selectedRarity: string = $state("All");
  let onlyWithDescription: boolean = $state(false);

  type SortKey = "recent" | "name" | "rarity";
  let sortBy: SortKey = $state("recent");
  let sortDir: "asc" | "desc" = $state("desc");
  const sortFields = [
    { value: "recent", label: "Recent" },
    { value: "name", label: "Name" },
    { value: "rarity", label: "Rarity" },
  ];

  let currentPage: number = $state(1);
  let itemsPerPage: number = $state(6);

  // Derived
  const total = $derived(user_achievements.length);
  const rarities: string[] = $derived(
    Array.from(new Set(user_achievements.map((a) => a.rarity).filter(Boolean))).sort()
  );
  const uniqueRaritiesCount = $derived(rarities.length);
  const lastEarned = $derived(
    user_achievements
      .map((a) => a.created_at)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
  );

  // Centralized rarity styles → maintainable & consistent
  type RarityKey =
    | "Special"
    | "Mythic"
    | "Legendary"
    | "Exotic"
    | "Epic"
    | "Rare"
    | "Common";
  const rarityStyles: Record<
    RarityKey,
    { bg: string; text: string; ring?: string }
  > = {
    Special: {
      bg: "bg-gradient-to-b from-yellow-400 via-pink-500 to-purple-600",
      text: "text-neutral-900",
    },
    Mythic: {
      bg: "bg-gradient-to-r from-red-600 to-rose-700",
      text: "text-white",
    },
    Legendary: {
      bg: "bg-gradient-to-r from-yellow-300 to-yellow-500",
      text: "text-neutral-900",
    },
    Exotic: { bg: "bg-teal-400", text: "text-neutral-900" },
    Epic: { bg: "bg-purple-600", text: "text-white" },
    Rare: { bg: "bg-blue-600", text: "text-white" },
    Common: { bg: "bg-neutral-700", text: "text-white" },
  };

  function styleFor(rarity?: string) {
    const key = (rarity as RarityKey) ?? "Common";
    return rarityStyles[key] ?? rarityStyles.Common;
  }

  const rarityWeight: Record<RarityKey, number> = {
    Special: 7,
    Mythic: 6,
    Legendary: 5,
    Exotic: 4,
    Epic: 3,
    Rare: 2,
    Common: 1,
  };

  const filtered = $derived.by(() => {
    const term = searchTerm.trim().toLowerCase();
    return user_achievements.filter((a) => {
      const name = (a.name ?? "").toLowerCase();
      const desc = (a.description ?? "").toLowerCase();
      const rarityOk = selectedRarity === "All" || a.rarity === selectedRarity;
      const descOk = !onlyWithDescription || (!!a.description && a.description.trim().length > 0);
      const textOk = name.includes(term) || desc.includes(term);
      return rarityOk && descOk && textOk;
    });
  });

  const sorted = $derived.by(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      if (sortBy === "recent") {
        const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bd - ad; // default desc
      }
      if (sortBy === "name") {
        return (a.name ?? "").localeCompare(b.name ?? "");
      }
      if (sortBy === "rarity") {
        const aw = rarityWeight[(a.rarity as RarityKey) ?? "Common"] ?? 0;
        const bw = rarityWeight[(b.rarity as RarityKey) ?? "Common"] ?? 0;
        return bw - aw; // default desc (higher rarity first)
      }
      return 0;
    });
    if (sortDir === "asc") arr.reverse();
    return arr;
  });

  const totalPages = $derived.by(() => Math.max(1, Math.ceil(sorted.length / itemsPerPage)));
  const paginated = $derived.by(() => {
    const page = Math.min(Math.max(1, currentPage), totalPages);
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sorted.slice(start, end);
  });

  $effect(() => {
    const _ = [filtered];
    currentPage = 1;
  });
</script>

<svelte:head>
  <title>{profile.display_name}'s Achievements - CubeIndex</title>
</svelte:head>

<div class="relative mx-auto mt-12 max-w-6xl px-4">
  <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight">
        {profile.display_name}'s Achievements
      </h1>
      <p class="text-sm text-base-content/70">{total} earned</p>
    </div>

    {#if total > 0}
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2">
          <SortSelector bind:sortField={sortBy} bind:sortOrder={sortDir} fields={sortFields} />
        </div>

        <div class="divider divider-horizontal m-0"></div>

        <div class="flex items-center gap-2">
          <label class="text-sm" for="itemsPerPage">Per page</label>
          <select
            id="itemsPerPage"
            bind:value={itemsPerPage}
            class="select select-bordered"
            onchange={() => (itemsPerPage = +itemsPerPage)}
          >
            <option value={6}>6</option>
            <option value={9}>9</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
          </select>
        </div>
      </div>
    {/if}
  </header>

  <!-- Quick stats -->
  {#if total > 0}
    <div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="stats shadow bg-base-200 border border-base-300">
        <div class="stat">
          <div class="stat-title">Total</div>
          <div class="stat-value">{total}</div>
        </div>
      </div>
      <div class="stats shadow bg-base-200 border border-base-300">
        <div class="stat">
          <div class="stat-title">Last Earned</div>
          <div class="stat-value text-warning text-lg">
            {lastEarned ? formatDate(lastEarned) : '—'}
          </div>
        </div>
      </div>
    </div>
  {/if}

  <SearchBar
    showFilter={false}
    bind:searchTerm
    placeholderLabel="Search achievements"
  />

  {#if total > 0}
    <div class="flex flex-col lg:flex-row gap-8">
      <div class="flex-1">
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {#each paginated as achievement (achievement.name)}
            <div>
              <article
                class="group relative overflow-hidden rounded-2xl border border-base-300 bg-base-200 shadow-sm ring-1 ring-transparent transition focus-within:ring-2 focus-within:ring-accent"
                aria-label={`Achievement: ${achievement.name}`}
              >
                <div class={"h-16 w-full " + styleFor(achievement.rarity).bg}></div>

                <div class="p-5">
                  <div class="-mt-9 mb-3 flex items-center justify-between gap-3">
                    <div
                      class={"inline-flex h-14 w-14 items-center justify-center rounded-xl ring-2 ring-base-200 bg-base-100 text-3xl select-none"}
                      aria-hidden="true"
                    >
                      {achievement.icon}
                    </div>

                    <span
                      class={"inline-flex items-center rounded-bl-md select-none rounded-br-md px-3 py-1 text-[11px] font-semibold ring-0 ring-black/5 " +
                        styleFor(achievement.rarity).bg +
                        " " +
                        styleFor(achievement.rarity).text}
                      title={`Rarity: ${achievement.rarity}`}
                    >
                      {achievement.rarity}
                    </span>
                  </div>

                  <h3 class="text-lg font-bold leading-snug">{achievement.name}</h3>

                  {#if achievement.description}
                    <p class="mt-1 text-sm text-base-content/70 line-clamp-2">
                      {achievement.description}
                    </p>
                  {/if}

                  <dl class="mt-4 grid grid-cols-1 gap-2 text-sm">
                    {#if achievement.awarded_at}
                      <div class="flex items-start justify-between gap-3">
                        <dt class="text-base-content/60">Earned</dt>
                        <dd class="font-medium text-right">
                          {formatDate(achievement.awarded_at)}
                        </dd>
                      </div>
                    {/if}
                  </dl>
                </div>
              </article>
            </div>
          {/each}
        </div>

        <div class="mt-8">
          <Pagination bind:currentPage {totalPages} />
        </div>
      </div>
    </div>
  {:else}
    <div class="col-span-full flex flex-col items-center justify-center py-20">
      <i class="fa-solid fa-trophy fa-3x mb-4"></i>
      <h2 class="text-2xl font-semibold mb-2">
        This user didn't earn any achievements yet.
      </h2>
    </div>
  {/if}
</div>
