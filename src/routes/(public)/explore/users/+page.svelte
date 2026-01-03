<script lang="ts">
  import UserCard from "$lib/components/user/userCard.svelte";
  import type { SortFieldOption } from "$lib/components/misc/sortSelector.svelte";
  import SearchBar from "$lib/components/misc/searchBar.svelte";
  import Pagination from "$lib/components/misc/pagination.svelte";
  import ItemsPerPageSelector from "$lib/components/misc/itemsPerPageSelector.svelte";
  import SortSelector from "$lib/components/misc/sortSelector.svelte";
  import type { DetailedProfile } from "$lib/queries/detailedProfiles";

  const { data } = $props();
  const profiles: DetailedProfile[] = data.profiles;

  let searchTerm: string = $state(""); // Text input for search bar

  const filteredUsers = $derived.by(() => {
    return profiles.filter((p) => {
      const lowerDisplayName = p.display_name.toLowerCase();
      const lowerUserName = p.display_name.toLowerCase();
      return (
        lowerDisplayName.includes(searchTerm.toLowerCase()) ||
        lowerUserName.includes(searchTerm.toLowerCase())
      );
    });
  });

  let sortField: string = $state("cubes"); // Field to sort by
  let sortOrder: "asc" | "desc" = $state("desc"); // Sort direction
  const sortFields: SortFieldOption[] = [
    { value: "date", label: "Recent" },
    { value: "name", label: "Name" },
    { value: "cubes", label: "Cubes" },
    { value: "achi", label: "Achievements" },
    { value: "followers", label: "Followers" },
  ];

  const sortedUsers = $derived.by(() => {
    const arr = filteredUsers.slice();
    arr.sort((a, b) => {
      let av: any;
      let bv: any;
      switch (sortField) {
        case "cubes":
          av = a.user_cubes_count ?? 0;
          bv = b.user_cubes_count ?? 0;
          break;
        case "achi":
          av = a.user_achievements_count ?? 0;
          bv = b.user_achievements_count ?? 0;
          break;
        case "followers":
          av = a.user_follower_count ?? 0;
          bv = b.user_follower_count ?? 0;
          break;
        case "name":
          av = a.display_name;
          bv = b.display_name;
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

  let itemsPerPage: number = $state(12); // Items shown per page
  let currentPage: number = $state(1); // Current pagination page

  const paginatedUsers = $derived.by(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedUsers.slice(start, end);
  });

  // Calculate total pages for pagination
  const totalPages = $derived(Math.max(Math.ceil(sortedUsers.length / itemsPerPage), 1));

  $effect(() => {
    const _ = sortedUsers;
    currentPage = 1;
  });
</script>

<svelte:head>
  <title>Explore Users - CubeIndex</title>
</svelte:head>
  <section class="min-h-screen px-6 py-16">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-clash font-bold mb-10 text-center">
        Explore Users
      </h1>

      <SearchBar
        bind:searchTerm
        showFilter={false}
        placeholderLabel="Search Users"
      />

      <!-- Controls: items per page & sorting -->
      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4"
      >
        <div class="flex flex-wrap items-center gap-4">
          <ItemsPerPageSelector bind:itemsPerPage label="Users per page" />
          <SortSelector bind:sortField bind:sortOrder fields={sortFields} />
        </div>
      </div>

      <div class="mb-10">
        <Pagination bind:currentPage {totalPages} />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {#each paginatedUsers as profile}
          {#key paginatedUsers}
            <UserCard {profile} />
          {/key}
        {:else}
          <!-- No results state -->
          <div
            class="col-span-full flex flex-col items-center justify-center py-20"
          >
            <i class="fa-solid fa-users fa-3x mb-4"></i>
            <h2 class="text-2xl font-semibold mb-2">No users found</h2>
            <p class="mb-6 text-center max-w-xs">
              We couldn't find any users matching your search or filters. Try
              adjusting them or resetting to see everything.
            </p>
            <button
              onclick={() => (searchTerm = "")}
              class="btn btn-outline flex items-center"
              aria-label="Reset filters"
            >
              <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
              Reset
            </button>
          </div>
        {/each}
      </div>

      <div class="mt-10">
        <Pagination bind:currentPage {totalPages} />
      </div>
    </div>
  </section>