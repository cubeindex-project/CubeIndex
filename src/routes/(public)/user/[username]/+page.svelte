<script lang="ts">
  import { resolve } from "$app/paths";
  import UserCubeCard from "$lib/components/cube/UserCubeCard.svelte";
  import ExplorePage from "$lib/components/explore/ExplorePage.svelte";
  import UserExploreHeader from "$lib/components/explore/UserExploreHeader.svelte";
  import {
    parseAsInteger,
    parseAsString,
    parseAsStringLiteral,
  } from "nuqs-svelte";

  const SORT_FIELDS = ["recent", "name", "rating", "type"] as const;

  const { data } = $props();
  const { profile, user, user_cube_ratings, user_cubes } = $derived(data);
  const total = $derived(user_cubes.length);

  let edit = $state(false);

  const allTypes = $derived(
    Array.from(
      new Set(
        user_cubes
          .map((userCube) => userCube.cube_model?.type)
          .filter((type): type is string => type !== undefined),
      ),
    ).sort(),
  );
  const allStatuses = $derived(
    Array.from(
      new Set(
        user_cubes
          .map((userCube) => userCube.status)
          .filter(
            (status): status is Exclude<typeof status, null> => status !== null,
          ),
      ),
    ).sort(),
  );
  const allConditions = $derived(
    Array.from(
      new Set(
        user_cubes
          .map((userCube) => userCube.condition)
          .filter(
            (condition): condition is Exclude<typeof condition, null> =>
              condition !== null,
          ),
      ),
    ).sort(),
  );

  function getCubeName(userCube: (typeof user_cubes)[number]): string {
    return userCube.cube_model.name;
  }
</script>

<ExplorePage
  searchPlaceholder="Search cubes"
  itemsPerPageLabel="Cubes per page"
  items={user_cubes}
  queryStateKeyMap={{
    q: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    size: parseAsInteger.withDefault(12),
    sort: parseAsStringLiteral(SORT_FIELDS),
    dir: parseAsStringLiteral(["asc", "desc"]).withDefault("desc"),
    type: parseAsString.withDefault("All"),
    condition: parseAsString.withDefault("All"),
    status: parseAsString.withDefault("All"),
  }}
  fuseOptions={{
    keys: ["cube_model.name"],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
  }}
  showFilterDrawer={true}
  filterFunc={(cubes, params) =>
    cubes.filter(
      (userCube) =>
        (params.type.current === "All" ||
          userCube.cube_model?.type === params.type.current) &&
        (params.condition.current === "All" ||
          userCube.condition === params.condition.current) &&
        (params.status.current === "All" ||
          userCube.status === params.status.current),
    )}
  sortFunc={(cubes, sortField, sortDirection) =>
    [...cubes].sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortField) {
        case "name":
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
        case "type":
          return sortDirection === "asc"
            ? (a.cube_model?.type ?? "").localeCompare(b.cube_model?.type ?? "")
            : (b.cube_model?.type ?? "").localeCompare(
                a.cube_model?.type ?? "",
              );
        case "rating":
          aValue =
            user_cube_ratings.find(
              (rating) => rating.cube_slug === a.cube_model?.slug,
            )?.rating ?? 0;
          bValue =
            user_cube_ratings.find(
              (rating) => rating.cube_slug === b.cube_model?.slug,
            )?.rating ?? 0;
          break;
        default:
          aValue = a.acquired_at ? new Date(a.acquired_at).getTime() : 0;
          bValue = b.acquired_at ? new Date(b.acquired_at).getTime() : 0;
      }

      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    })}
  sortFields={[
    { value: "recent", label: "Recent" },
    { value: "name", label: "Name" },
    { value: "rating", label: "Rating" },
    { value: "type", label: "Type" },
  ]}
  defaultSortField="recent"
  noResultsTitle={total === 0
    ? "This user doesn't have any cubes in their collection"
    : "No cubes found"}
  noResultsMessage={total === 0
    ? "There are no cubes to show yet."
    : "We couldn't find any cubes matching your search or filters. Try adjusting them or resetting to see everything."}
  noResultsIcon="fa-solid fa-cube"
>
  {#snippet header()}
    <UserExploreHeader
      title={`${profile.display_name}'s Cube Collection`}
      subtitle={`${total} cubes`}
    >
      {#snippet action()}
        {#if user?.id === profile.user_id && total > 0}
          <button
            class:btn-error={edit}
            class="btn btn-outline btn-sm"
            type="button"
            onclick={() => (edit = !edit)}
          >
            <i class={edit ? "fa-solid fa-xmark" : "fa-solid fa-pencil"}></i>
            {edit ? "Cancel" : "Edit"}
          </button>
        {/if}
      {/snippet}
    </UserExploreHeader>
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
        <span class="label-text text-sm">Condition</span>
        <select
          bind:value={params.condition.current}
          class="select select-bordered w-full"
        >
          <option>All</option>
          {#each allConditions as condition (condition)}
            <option>{condition}</option>
          {/each}
        </select>
      </label>
      <label class="form-control w-full">
        <span class="label-text text-sm">Status</span>
        <select
          bind:value={params.status.current}
          class="select select-bordered w-full"
        >
          <option>All</option>
          {#each allStatuses as status (status)}
            <option>{status}</option>
          {/each}
        </select>
      </label>
    </div>
  {/snippet}
  {#snippet renderItem(userCube)}
    <UserCubeCard
      mode={edit ? "edit" : "view"}
      cube={userCube.cube_model}
      user_details={userCube}
      user_rating={user_cube_ratings.find(
        (rating) => rating.cube_slug === userCube.cube_model?.slug,
      )?.rating ?? 0}
    />
  {/snippet}
  {#snippet noResultsAction()}
    {#if total === 0 && user?.id === profile.user_id}
      <a href={resolve("/explore/cubes")} class="btn btn-primary">
        Browse cubes
        <i class="fa-solid fa-arrow-right"></i>
      </a>
    {/if}
  {/snippet}
</ExplorePage>
