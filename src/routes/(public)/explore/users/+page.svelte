<script lang="ts">
  import UserCard from "$lib/components/user/userCard.svelte";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { page } from "$app/state";
  import type { SortOption } from "$lib/components/misc/sortSelector.svelte";
  import SearchBar from "$lib/components/misc/searchBar.svelte";
  import Pagination from "$lib/components/misc/pagination.svelte";
  import ItemsPerPageSelector from "$lib/components/misc/itemsPerPageSelector.svelte";
  import SortSelector from "$lib/components/misc/sortSelector.svelte";

  const { data } = $props();
  const { profiles } = data;

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
  const sortOptions: SortOption[] = [
    { id: "name-asc", field: "name", order: "asc", label: "Name - A to Z" },
    {
      id: "name-desc",
      field: "name",
      order: "desc",
      label: "Name - Z to A",
    },
    {
      id: "cubes-desc",
      field: "cubes",
      order: "desc",
      label: "Cubes",
    },
    {
      id: "achi-desc",
      field: "achi",
      order: "desc",
      label: "Achievements",
    },
    
    {
      id: "followers-desc",
      field: "followers",
      order: "desc",
      label: "Followers",
    },
    { id: "date-desc", field: "date", order: "desc", label: "Joined Date" },
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
  const totalPages = $derived(Math.ceil(sortedUsers.length / itemsPerPage));

  $effect(() => {
    const _ = sortedUsers;
    currentPage = 1;
  });
</script>

<svelte:head>
  <title>Explore Users - CubeIndex</title>
</svelte:head>

<SsgoiTransition id={page.url.pathname}>
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
          <SortSelector bind:sortField bind:sortOrder {sortOptions} />
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
        {/each}
      </div>

      <div class="mt-10">
        <Pagination bind:currentPage {totalPages} />
      </div>
    </div>
  </section>
</SsgoiTransition>
