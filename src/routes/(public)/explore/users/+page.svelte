<script lang="ts">
  import UserCard from "$lib/components/user/userCard.svelte";
  import type { SortFieldOption } from "$lib/components/misc/sortSelector.svelte";
  import SearchBar from "$lib/components/misc/searchBar.svelte";
  import Pagination from "$lib/components/misc/pagination.svelte";
  import ItemsPerPageSelector from "$lib/components/misc/itemsPerPageSelector.svelte";
  import SortSelector from "$lib/components/misc/sortSelector.svelte";
  import type { DetailedProfile } from "$lib/queries/detailedProfiles";
  import { m } from "$lib/paraglide/messages";

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
    { value: "date", label: m.explore_users_sort_recent_label() },
    { value: "name", label: m.explore_users_sort_name_label() },
    { value: "date", label: m.common_sort_recent_label() },
    { value: "name", label: m.common_sort_name_label() },
    { value: "cubes", label: m.explore_users_sort_cubes_label() },
    { value: "achi", label: m.explore_users_sort_achievements_label() },
    { value: "followers", label: m.explore_users_sort_followers_label() },
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
  <title>{m.explore_users_page_title_text()}</title>
  <title>{m.explore_users_meta_title()}</title>
</svelte:head>
  <section class="min-h-screen px-6 py-16">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-clash font-bold mb-10 text-center">
        {m.explore_users_heading_h1()}
        {m.explore_users_title_h1()}
      </h1>

      <SearchBar
        bind:searchTerm
        showFilter={false}
        placeholderLabel={m.explore_users_search_placeholder_label()}
        placeholderLabel={m.explore_users_search_placeholder()}
      />

      <!-- Controls: items per page & sorting -->
      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4"
      >
        <div class="flex flex-wrap items-center gap-4">
          <ItemsPerPageSelector
            bind:itemsPerPage
            label={m.explore_users_items_per_page_label()}
          />
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
            <h2 class="text-2xl font-semibold mb-2">
              {m.explore_users_empty_title_h2()}
            </h2>
            <p class="mb-6 text-center max-w-xs">
              {m.explore_users_empty_description_text()}
              {m.explore_users_empty_title()}
            </h2>
            <p class="mb-6 text-center max-w-xs">
              {m.explore_users_empty_body_text()}
            </p>
            <button
              onclick={() => (searchTerm = "")}
              class="btn btn-outline flex items-center"
              aria-label={m.explore_users_reset_filters_aria()}
            >
              <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
              {m.explore_users_reset_filters_cta()}
              aria-label={m.common_action_reset_filters_aria()}
            >
              <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
              {m.common_action_reset_cta()}
            </button>
          </div>
        {/each}
      </div>

      <div class="mt-10">
        <Pagination bind:currentPage {totalPages} />
      </div>
    </div>
  </section>
