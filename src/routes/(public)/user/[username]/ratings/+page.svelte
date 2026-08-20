<script lang="ts">
  import { resolve } from "$app/paths";
  import ExplorePage from "$lib/components/explore/ExplorePage.svelte";
  import UserExploreHeader from "$lib/components/explore/UserExploreHeader.svelte";
  import UserRatingCard from "$lib/components/rating/UserRatingCard.svelte";
  import {
    createParser,
    parseAsInteger,
    parseAsString,
    parseAsStringLiteral,
  } from "nuqs-svelte";

  const SORT_FIELDS = ["recent", "rating", "name"] as const;

  const booleanParser = createParser({
    parse: (query: string): boolean => query === "1",
    serialize: (value: boolean) => (value ? "1" : "0"),
  });

  const { data } = $props();
  const { user_cube_ratings, user, profile } = $derived(data);
  const total = $derived(user_cube_ratings.length);

  const allTypes = $derived(
    Array.from(
      new Set(
        user_cube_ratings
          .map((rating) => rating.cube_model?.type)
          .filter((type): type is string => type !== undefined),
      ),
    ).sort(),
  );

  function getCubeName(rating: (typeof user_cube_ratings)[number]): string {
    const cube = rating.cube_model;
    return `${cube?.series ?? ""} ${cube?.model ?? ""} ${cube?.version_name ?? ""}`.trim();
  }
</script>

<ExplorePage
  searchPlaceholder="Search by cube name"
  itemsPerPageLabel="Ratings per page"
  items={user_cube_ratings}
  queryStateKeyMap={{
    q: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    size: parseAsInteger.withDefault(12),
    sort: parseAsStringLiteral(SORT_FIELDS),
    dir: parseAsStringLiteral(["asc", "desc"]).withDefault("desc"),
    type: parseAsString.withDefault("All"),
    rating: parseAsString.withDefault("All"),
    comments: booleanParser.withDefault(false),
  }}
  fuseOptions={{
    keys: ["cube_model.series", "cube_model.model", "cube_model.version_name"],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
  }}
  showFilterDrawer={true}
  filterFunc={(ratings, params) =>
    ratings.filter((rating) => {
      const value = rating.rating ?? 0;
      const matchesRating =
        params.rating.current === "All" ||
        (params.rating.current === "5" && value === 5) ||
        (params.rating.current === "4+" && value >= 4) ||
        (params.rating.current === "3+" && value >= 3) ||
        (params.rating.current === "<=2" && value <= 2);

      return (
        (params.type.current === "All" ||
          rating.cube_model?.type === params.type.current) &&
        (!params.comments.current ||
          (rating.comment ?? "").trim().length > 0) &&
        matchesRating
      );
    })}
  sortFunc={(ratings, sortField, sortDirection) =>
    [...ratings].sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc"
          ? getCubeName(a).localeCompare(getCubeName(b), undefined, {
              numeric: true,
              sensitivity: "base",
              ignorePunctuation: true,
            })
          : getCubeName(b).localeCompare(getCubeName(a), undefined, {
              numeric: true,
              sensitivity: "base",
              ignorePunctuation: true,
            });
      }

      const aValue =
        sortField === "rating"
          ? (a.rating ?? 0)
          : new Date(a.created_at ?? 0).getTime();
      const bValue =
        sortField === "rating"
          ? (b.rating ?? 0)
          : new Date(b.created_at ?? 0).getTime();

      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    })}
  sortFields={[
    { value: "recent", label: "Recent" },
    { value: "rating", label: "Rating" },
    { value: "name", label: "Name" },
  ]}
  defaultSortField="recent"
  noResultsTitle={total === 0
    ? "This user didn't rate any cubes"
    : "No ratings found"}
  noResultsMessage={total === 0
    ? "There are no ratings to show yet."
    : "We couldn't find any ratings matching your search or filters. Try adjusting them or resetting to see everything."}
  noResultsIcon="fa-solid fa-ranking-star"
>
  {#snippet header()}
    <UserExploreHeader
      title={`${profile.display_name}'s Ratings`}
      subtitle={`${total} ratings`}
    />
  {/snippet}
  {#snippet filterContent(params)}
    <div class="flex flex-col gap-2">
      <label class="form-control w-full">
        <span class="label-text text-sm">Type</span>
        <select
          bind:value={params.type.current}
          class="select select-bordered w-full"
        >
          <option>All</option>
          {#each allTypes as type (type)}
            <option>{type}</option>
          {/each}
        </select>
      </label>
      <label class="form-control w-full">
        <span class="label-text text-sm">Rating</span>
        <select
          bind:value={params.rating.current}
          class="select select-bordered w-full"
        >
          <option>All</option>
          <option value="5">5</option>
          <option value="4+">4+</option>
          <option value="3+">3+</option>
          <option value="<=2">≤2</option>
        </select>
      </label>
      <label class="cursor-pointer label justify-start gap-3">
        <input
          type="checkbox"
          class="checkbox"
          bind:checked={params.comments.current}
        />
        <span class="label-text">Only with comments</span>
      </label>
    </div>
  {/snippet}
  {#snippet renderItem(userRating)}
    <UserRatingCard
      user_rating={userRating}
      cube={userRating.cube_model}
      isAuthor={userRating.user_id === user?.id}
      showCubeDetails={true}
    />
  {/snippet}
  {#snippet noResultsAction()}
    {#if total === 0 && user?.id === profile.user_id}
      <a href={resolve("/explore/cubes")} class="btn btn-primary">
        Browse cubes to rate
        <i class="fa-solid fa-arrow-right"></i>
      </a>
    {/if}
  {/snippet}
</ExplorePage>
