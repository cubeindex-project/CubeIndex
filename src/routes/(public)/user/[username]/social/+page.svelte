<script lang="ts">
  import FollowButton from "$lib/components/misc/followButton.svelte";
  import Avatar from "$lib/components/user/avatar.svelte";
  import SearchBar from "$lib/components/misc/searchBar.svelte";
  import Pagination from "$lib/components/misc/pagination.svelte";
  import type { PageData } from "./$types";
  import type { Profiles } from "$lib/components/dbTableTypes";

  let { data }: { data: PageData } = $props();
  const { profile, user, followers, following, isFollowing } = data;

  // Tabs
  let tab: "following" | "followers" = $state("following");

  // Search & Filters
  let searchTerm: string = $state("");
  let verifiedOnly: boolean = $state(false);
  let certifiedOnly: boolean = $state(false);

  // Pagination
  let currentPage: number = $state(1);
  let itemsPerPage: number = $state(18);

  // Derived
  const followingCount = $derived(following.length);
  const followersCount = $derived(followers.length);

  // @ts-expect-error
  const sourceList: Profiles[] = $derived(
    tab === "following" ? following : followers
  );

  const filtered = $derived.by(() => {
    const term = searchTerm.trim().toLowerCase();
    return sourceList.filter((p) => {
      const name = (p.display_name ?? "").toLowerCase();
      const uname = (p.username ?? "").toLowerCase();
      const verifiedOk = !verifiedOnly || !!p.verified;
      const certifiedOk = !certifiedOnly || !!p.certified;
      return (
        (name.includes(term) || uname.includes(term)) &&
        verifiedOk &&
        certifiedOk
      );
    });
  });

  const totalPages = $derived.by(() =>
    Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  );

  const paginated = $derived.by(() => {
    const page = Math.min(Math.max(1, currentPage), totalPages);
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filtered.slice(start, end);
  });

  $effect(() => {
    const _ = [filtered, tab];
    currentPage = 1;
  });
</script>

<div class="max-w-6xl mx-auto mt-12 px-4">
  <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight">
        {profile.display_name}'s Social
      </h1>
      <p class="text-sm text-base-content/70">
        {followingCount} following ・ {followersCount} followers
      </p>
    </div>

    <div class="flex items-center gap-2">
      <div class="join">
        <button
          type="button"
          class="btn btn-sm join-item {tab === 'following'
            ? 'btn-active'
            : 'btn-ghost'}"
          onclick={() => (tab = "following")}
        >
          Following
        </button>
        <button
          type="button"
          class="btn btn-sm join-item {tab === 'followers'
            ? 'btn-active'
            : 'btn-ghost'}"
          onclick={() => (tab = "followers")}
        >
          Followers
        </button>
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
          <option value={12}>12</option>
          <option value={18}>18</option>
          <option value={24}>24</option>
          <option value={36}>36</option>
        </select>
      </div>
    </div>
  </header>

  <SearchBar
    showFilter={false}
    bind:searchTerm
    placeholderLabel="Search people"
  />

  <div class="flex flex-col lg:flex-row gap-8">
    <main class="flex-1">
      {#if sourceList && sourceList.length > 0}
        <ul class="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {#each paginated as f (f.user_id)}
            <li>
              <a class="group block" href="/user/{f.username}">
                <article
                  class="relative overflow-hidden rounded-2xl border border-base-300 bg-base-200 p-4 shadow-sm transition hover:shadow-md"
                >
                  <div class="flex items-center gap-4">
                    <Avatar profile={f} imgSize="size-16" textSize="text-2xl" />
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <h3 class="font-semibold truncate">{f.display_name}</h3>
                      </div>
                      <p class="text-sm text-base-content/70 truncate">
                        @{f.username}
                      </p>
                    </div>
                  </div>
                </article>
              </a>
            </li>
          {:else}
            <!-- No results state -->
            <div
              class="col-span-full flex flex-col items-center justify-center py-20"
            >
              {#if tab === "following"}
                <i class="fa-solid fa-user fa-3x mb-4"></i>
              {:else}
                <i class="fa-solid fa-users fa-3x mb-4"></i>
              {/if}
              <h2 class="text-2xl font-semibold mb-2">
                No {tab === "followers"
                  ? `users following ${profile.display_name}`
                  : `users ${profile.display_name} follows`} found
              </h2>
              <p class="mb-6 text-center max-w-xs">
                We couldn't find any {tab === "followers"
                  ? `users following ${profile.display_name}`
                  : `users ${profile.display_name} follows`} matching your search
                or filters. Try adjusting them or resetting to see everything.
              </p>
              <button
                onclick={() => {
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
        </ul>

        <div class="mt-8">
          <Pagination bind:currentPage {totalPages} />
        </div>
      {:else}
        <div
          class="w-full flex flex-col items-center justify-center py-20 text-center"
        >
          <div class="text-5xl mb-4">
            {#if tab === "following"}
              <i class="fa-solid fa-user"></i>
            {:else}
              <i class="fa-solid fa-users"></i>
            {/if}
          </div>
          <h2 class="text-2xl font-semibold mb-2">
            {#if tab === "following"}
              {#if profile.user_id === user?.id}
                Not following anyone yet
              {:else}
                {profile.display_name} isn’t following anyone yet
              {/if}
            {:else if profile.user_id === user?.id}
              No followers yet
            {:else}
              {profile.display_name} has no followers yet
            {/if}
          </h2>
          <p class="text-base opacity-80 mb-4">
            {#if tab === "following"}
              {#if profile.user_id === user?.id}
                When you follow someone, you'll see them here.
              {:else}
                When they follow someone, their connections will appear here.
              {/if}
            {:else if profile.user_id === user?.id}
              Once someone follows you, they’ll show up here.
            {:else}
              When someone follows {profile.display_name}, they’ll be listed
              here.
            {/if}
          </p>
          {#if tab === "following" && profile.user_id === user?.id}
            <a href="/explore/users" class="btn btn-primary">
              Find users to follow
            </a>
          {:else if tab === "followers" && profile.user_id !== user?.id}
            <FollowButton user_id={profile.user_id} {isFollowing} />
          {/if}
        </div>
      {/if}
    </main>
  </div>
</div>
