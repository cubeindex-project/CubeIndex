<script lang="ts">
  import ExplorePage from "$lib/components/explore/ExplorePage.svelte";
  import CubeCard from "$lib/components/cube/CubeCard.svelte";
  import { resolve } from "$app/paths";
  import {
    createParser,
    parseAsString,
    parseAsInteger,
    parseAsStringLiteral,
  } from "nuqs-svelte";
  import TriStateCheckbox from "$lib/components/explore/TriStateCheckbox.svelte";
  import ExploreHeader from "$lib/components/explore/ExploreHeader.svelte";

  const SORT_FIELDS = [
    "name",
    "rating",
    "popularity",
    "date",
    "price",
  ] as const;

  const { data } = $props();
  const { cubes, userCubes } = $derived(data);

  const triParser = createParser({
    parse: (query: string): boolean => (query === "1" ? true : false),
    serialize: (value: boolean) => (value === true ? "1" : "0"),
  });

  const yearParser = createParser({
    parse: (query: string): number | "All" | null => {
      if (query === "All") return "All";
      const num = parseInt(query, 10);
      return isNaN(num) ? null : num;
    },
    serialize: (value: number | "All") => {
      return String(value);
    },
  });

  function uniqueSorted<T>(
    values: (T | null | undefined)[],
    compareFn?: (a: T, b: T) => number,
  ): T[] {
    return Array.from(new Set(values.filter((v): v is T => v != null))).sort(
      compareFn,
    );
  }

  let allTypes: string[] = $derived(uniqueSorted(cubes.map((c) => c.type)));

  let allBrands: string[] = $derived(uniqueSorted(cubes.map((c) => c.brand)));

  let allYears: number[] = $derived(
    uniqueSorted(
      cubes.map((c) => c.year),
      (a, b) => b - a,
    ),
  );

  let allSubTypes: string[] = $derived(
    uniqueSorted(cubes.map((c) => c.sub_type)),
  );
</script>

<ExplorePage
  searchPlaceholder="Search Cubes"
  itemsPerPageLabel="Cubes per page"
  items={cubes}
  queryStateKeyMap={{
    q: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    size: parseAsInteger.withDefault(12),
    sort: parseAsStringLiteral(SORT_FIELDS),
    dir: parseAsStringLiteral(["asc", "desc"]).withDefault("asc"),

    type: parseAsString.withDefault("All"),
    sub: parseAsString.withDefault("All"),
    brand: parseAsString.withDefault("All"),
    year: yearParser.withDefault("All"),

    wca: triParser,
    mag: triParser,
    smart: triParser,
    mod: triParser,
    stick: triParser,

    base: triParser,
    trim: triParser,
    limit: triParser,
  }}
  fuseOptions={{
    keys: ["name"],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
  }}
  showFilterDrawer={true}
  filterFunc={(cubes, params) => {
    return cubes.filter(
      (c) =>
        (params.type.current === "All" || c.type === params.type.current) &&
        (params.sub.current === "All" || c.sub_type === params.sub.current) &&
        (params.brand.current === "All" || c.brand === params.brand.current) &&
        (params.year.current === "All" || c.year === +params.year.current) &&
        (params.base.current === null
          ? true
          : params.base.current
            ? c.version_type === "Base"
            : c.version_type !== "Base") &&
        (params.trim.current === null
          ? true
          : params.trim.current
            ? c.version_type === "Trim"
            : c.version_type !== "Trim") &&
        (params.limit.current === null
          ? true
          : params.limit.current
            ? c.version_type === "Limited"
            : c.version_type !== "Limited") &&
        (params.wca.current === null || c.wca_legal === params.wca.current) &&
        (params.mag.current === null || c.magnetic === params.mag.current) &&
        (params.mod.current === null || c.modded === params.mod.current) &&
        (params.stick.current === null ||
          c.stickered === params.stick.current) &&
        (params.smart.current === null || c.smart === params.smart.current),
    );
  }}
  sortFunc={(cubes, sortField, sortDirection) =>
    cubes.sort((a, b) => {
      let av;
      let bv;

      switch (sortField) {
        case "rating":
          av = a.rating ?? 0;
          bv = b.rating ?? 0;
          break;
        case "popularity":
          av = a.popularity ?? 0;
          bv = b.popularity ?? 0;
          break;
        case "price":
          av = a.avg_price ?? 0;
          bv = b.avg_price ?? 0;
          break;
        case "name": {
          const an = a.name ?? "";
          const bn = b.name ?? "";
          return sortDirection === "asc"
            ? an.localeCompare(bn, undefined, {
                numeric: true,
                sensitivity: "base",
                ignorePunctuation: true,
              })
            : bn.localeCompare(an, undefined, {
                numeric: true,
                sensitivity: "base",
                ignorePunctuation: true,
              });
        }
        default:
          av = new Date(a.verified_at ?? a.created_at ?? 0).getTime();
          bv = new Date(b.verified_at ?? b.created_at ?? 0).getTime();
      }

      if (av < bv) return sortDirection === "asc" ? -1 : 1;
      if (av > bv) return sortDirection === "asc" ? 1 : -1;
      return 0;
    })}
  sortFields={[
    { value: "date", label: "Recent" },
    { value: "name", label: "Name" },
    { value: "rating", label: "Rating" },
    { value: "popularity", label: "Popularity" },
    { value: "price", label: "Price" },
  ]}
  defaultSortField="name"
  noResultsTitle="No cubes found"
  noResultsMessage="We couldn't find any cubes matching your search or filters; try adjusting them or resetting to see everything. If the cube you're looking for isn't listed, consider submitting it to help grow our database."
  noResultsIcon="fa-solid fa-cube"
>
  {#snippet header()}
    <ExploreHeader
      title="Explore Cubes"
      subtitle="Browse all your favorite cubes by type, brand, or rating."
    />
  {/snippet}
  {#snippet action()}
    <a
      href={resolve("/explore/cubes/compare")}
      class="btn bg-primary text-primary-content"
    >
      <i class="fa-solid fa-code-compare sm:mr-2"></i>
      Compare <span class="hidden sm:block">Cubes</span>
    </a>
  {/snippet}
  {#snippet filterContent(params)}
    <div class="flex flex-col gap-2 mb-4">
      <label class="block">
        Type:
        <select bind:value={params.type.current} class="select">
          <option>All</option>
          {#each allTypes as t, index (index)}
            <option>{t}</option>
          {/each}
        </select>
      </label>
      <label class="block">
        Sub Type:
        <select bind:value={params.sub.current} class="select">
          <option>All</option>
          {#each allSubTypes as st, index (index)}
            <option>{st}</option>
          {/each}
        </select>
      </label>
      <label class="block">
        Brand:
        <select bind:value={params.brand.current} class="select">
          <option>All</option>
          {#each allBrands as b, index (index)}
            <option>{b}</option>
          {/each}
        </select>
      </label>
      <label class="block">
        Release Year:
        <select
          bind:value={params.year.current}
          onchange={() => {
            params.set({
              year: params.year.current === "All" ? "All" : params.year.current,
            });
          }}
          class="select"
        >
          <option>All</option>
          {#each allYears as year, index (index)}
            <option value={year}>{year}</option>
          {/each}
        </select>
      </label>
    </div>
    <div class="grid grid-cols-2 gap-2">
      <TriStateCheckbox bind:value={params.wca.current} label="WCA Legal" />
      <TriStateCheckbox bind:value={params.mag.current} label="Magnetic" />
      <TriStateCheckbox bind:value={params.smart.current} label="Smart" />
      <TriStateCheckbox bind:value={params.stick.current} label="Stickered" />
      <TriStateCheckbox bind:value={params.mod.current} label="Modded" />
      <TriStateCheckbox bind:value={params.base.current} label="Base" />
      <TriStateCheckbox bind:value={params.trim.current} label="Trim" />
      <TriStateCheckbox bind:value={params.limit.current} label="Limited" />
    </div>
  {/snippet}
  {#snippet renderItem(cube)}
    {@const userCubeDetail = userCubes?.find((uc) => uc.cube === cube.slug)}
    <CubeCard
      {cube}
      showAddButton={true}
      showRateButton={true}
      showDetailsButton={true}
      alreadyAdded={userCubeDetail !== undefined}
      {userCubeDetail}
    />
  {/snippet}
  {#snippet noResultsAction()}
    <a href={resolve("/submit")} class="btn btn-primary flex items-center">
      <i class="fa-solid fa-plus mr-2"></i>
      Submit a New Cube
    </a>
  {/snippet}
</ExplorePage>
