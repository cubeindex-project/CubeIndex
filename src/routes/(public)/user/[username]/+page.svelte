<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { Constants } from "$lib/types/database.types";
  import {
    getUserCubeStatusLabel,
    USER_CUBE_STATUS_PRESENTATION,
  } from "$lib/utils/getUserCubeStatusLabel";
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
  const { profile, user, user_cube_ratings } = $derived(data);
  let user_cubes = $derived(data.user_cubes);
  const total = $derived(user_cubes.length);

  let edit = $state(false);

  const showExplorer = $derived(
    [
      "view",
      "status",
      "q",
      "page",
      "size",
      "sort",
      "dir",
      "type",
      "condition",
    ].some((key) => page.url.searchParams.has(key)),
  );
  const statusCollections = $derived(
    Constants.public.Enums.user_cube_status.map((status) => ({
      status,
      cubes: user_cubes.filter((cube) => cube.status === status),
    })),
  );

  const allTypes = $derived(
    Array.from(
      new Set(
        user_cubes
          .map((userCube) => userCube.cube_model?.type)
          .filter((type): type is string => type !== undefined),
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

{#if !showExplorer}
  <section class="px-6 py-16">
    <div class="max-w-7xl mx-auto">
      <UserExploreHeader
        title={`${profile.display_name}'s Cube Collection`}
        subtitle={`${total} cubes`}
      >
        {#snippet action()}
          <a
            href={resolve("/(public)/user/[username]?view=explore&status=All", {
              username: page.params.username!,
            })}
            class="btn btn-ghost btn-sm"
          >
            View all
            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </a>
        {/snippet}
      </UserExploreHeader>
      <div class="flex flex-col gap-6">
        {#each statusCollections as { status, cubes } (status)}
          {@const presentation = USER_CUBE_STATUS_PRESENTATION[status]}
          <a
            href={resolve(
              `/(public)/user/[username]?view=explore&status=${status}`,
              { username: page.params.username! },
            )}
            class="card card-border bg-base-200 transition-colors hover:border-base-content/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            aria-label={`View ${getUserCubeStatusLabel(status).toLowerCase()} cubes (${cubes.length})`}
          >
            <div class="card-body gap-4 p-5">
              <div class="flex items-center justify-between gap-3">
                <h2 class="card-title text-lg">
                  <i class={presentation.icon} aria-hidden="true"></i>
                  {getUserCubeStatusLabel(status)}
                  <span class="badge badge-ghost badge-sm">{cubes.length}</span>
                </h2>
                <i
                  class="fa-solid fa-arrow-right text-base-content/60"
                  aria-hidden="true"
                ></i>
              </div>
              {#if cubes.length > 0}
                <div
                  class="carousel carousel-start gap-4 rounded-box"
                  aria-label={`${getUserCubeStatusLabel(status)} cube preview`}
                >
                  {#each cubes.slice(0, 12) as userCube (userCube.id)}
                    <div class="carousel-item w-40 sm:w-48">
                      <div class="card card-sm bg-base-100 w-full">
                        <figure>
                          <img
                            src={`https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_403/${userCube.cube_model.image_url}`}
                            alt={userCube.cube_model.name}
                            class="h-32 w-full object-cover"
                            loading="lazy"
                          />
                        </figure>
                        <div class="card-body p-3">
                          <h3 class="text-sm font-medium line-clamp-2">
                            {userCube.cube_model.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="text-sm text-base-content/60">No cubes yet.</p>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    </div>
  </section>
{:else}
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
              ? (a.cube_model?.type ?? "").localeCompare(
                  b.cube_model?.type ?? "",
                )
              : (b.cube_model?.type ?? "").localeCompare(
                  a.cube_model?.type ?? "",
                );
          case "rating":
            aValue =
              user_cube_ratings.find(
                (rating) => rating.cube_id === a.cube_model?.id,
              )?.rating ?? 0;
            bValue =
              user_cube_ratings.find(
                (rating) => rating.cube_id === b.cube_model?.id,
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
          <div class="flex items-center gap-2">
            <a
              href={resolve("/(public)/user/[username]", {
                username: page.params.username!,
              })}
              class="btn btn-ghost btn-sm"
            >
              <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
              Collection
            </a>
            {#if user?.id === profile.user_id && total > 0}
              <button
                class:btn-error={edit}
                class="btn btn-outline btn-sm"
                type="button"
                onclick={() => (edit = !edit)}
              >
                <i class={edit ? "fa-solid fa-xmark" : "fa-solid fa-pencil"}
                ></i>
                {edit ? "Cancel" : "Edit"}
              </button>
            {/if}
          </div>
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
            <option value="All">All</option>
            {#each Constants.public.Enums.user_cube_status as status (status)}
              <option value={status}>{getUserCubeStatusLabel(status)}</option>
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
          (rating) => rating.cube_id === userCube.cube_model?.id,
        )?.rating ?? 0}
        onDelete={() =>
          (user_cubes = user_cubes.filter((cube) => cube.id !== userCube.id))}
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
{/if}
