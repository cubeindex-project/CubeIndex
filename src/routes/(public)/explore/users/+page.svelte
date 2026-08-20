<script lang="ts">
  import ExploreHeader from "$lib/components/explore/ExploreHeader.svelte";
  import ExplorePage from "$lib/components/explore/ExplorePage.svelte";
  import UserCard from "$lib/components/user/UserCard.svelte";
  import {
    parseAsInteger,
    parseAsString,
    parseAsStringLiteral,
  } from "nuqs-svelte";

  const SORT_FIELDS = ["date", "name", "cubes", "achi", "followers"] as const;

  const { data } = $props();
  const { profiles } = $derived(data);
</script>

<ExplorePage
  searchPlaceholder="Search Users"
  itemsPerPageLabel="Users per page"
  items={profiles}
  queryStateKeyMap={{
    q: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    size: parseAsInteger.withDefault(12),
    sort: parseAsStringLiteral(SORT_FIELDS),
    dir: parseAsStringLiteral(["asc", "desc"]).withDefault("desc"),
  }}
  fuseOptions={{
    keys: ["display_name", "username"],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
  }}
  showFilterDrawer={false}
  sortFunc={(profiles, sortField, sortDirection) =>
    [...profiles].sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortField) {
        case "cubes":
          aValue = a.user_cubes_count ?? 0;
          bValue = b.user_cubes_count ?? 0;
          break;
        case "achi":
          aValue = a.user_achievements_count ?? 0;
          bValue = b.user_achievements_count ?? 0;
          break;
        case "followers":
          aValue = a.user_follower_count ?? 0;
          bValue = b.user_follower_count ?? 0;
          break;
        case "name": {
          const aName = a.display_name ?? "";
          const bName = b.display_name ?? "";
          return sortDirection === "asc"
            ? aName.localeCompare(bName, undefined, {
                numeric: true,
                sensitivity: "base",
                ignorePunctuation: true,
              })
            : bName.localeCompare(aName, undefined, {
                numeric: true,
                sensitivity: "base",
                ignorePunctuation: true,
              });
        }
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    })}
  sortFields={[
    { value: "date", label: "Recent" },
    { value: "name", label: "Name" },
    { value: "cubes", label: "Cubes" },
    { value: "achi", label: "Achievements" },
    { value: "followers", label: "Followers" },
  ]}
  defaultSortField="cubes"
  noResultsTitle="No users found"
  noResultsMessage="We couldn't find any users matching your search. Try adjusting it or resetting to see everyone."
  noResultsIcon="fa-solid fa-users"
>
  {#snippet header()}
    <ExploreHeader
      title="Explore Users"
      subtitle="Discover cubers, their collections, and achievements."
    />
  {/snippet}
  {#snippet renderItem(profile)}
    <UserCard {profile} />
  {/snippet}
</ExplorePage>
