<script lang="ts">
  import { resolve } from "$app/paths";
  import ExplorePage from "$lib/components/explore/ExplorePage.svelte";
  import UserExploreHeader from "$lib/components/explore/UserExploreHeader.svelte";
  import FollowButton from "$lib/components/misc/followButton.svelte";
  import Avatar from "$lib/components/user/avatar.svelte";
  import {
    parseAsInteger,
    parseAsString,
    parseAsStringLiteral,
    useQueryState,
  } from "nuqs-svelte";

  const SOCIAL_TABS = ["following", "followers"] as const;
  const SORT_FIELDS = ["name"] as const;

  const { data } = $props();
  const { profile, user, followers, following, isFollowing } = $derived(data);

  const tab = useQueryState(
    "tab",
    parseAsStringLiteral(SOCIAL_TABS).withDefault("followers"),
  );

  const isFollowingTab = $derived(tab.current === "following");
  const sourceList = $derived(isFollowingTab ? following : followers);
  const followersCount = $derived(followers.length);
  const followingCount = $derived(following.length);
  const total = $derived(sourceList.length);

  function setTab(nextTab: (typeof SOCIAL_TABS)[number]) {
    tab.current = nextTab;
  }
</script>

<ExplorePage
  searchPlaceholder="Search people"
  itemsPerPageLabel="People per page"
  items={sourceList}
  queryStateKeyMap={{
    q: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    size: parseAsInteger.withDefault(12),
    sort: parseAsStringLiteral(SORT_FIELDS),
    dir: parseAsStringLiteral(["asc", "desc"]).withDefault("asc"),
  }}
  fuseOptions={{
    keys: ["display_name", "username"],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
  }}
  showFilterDrawer={false}
  sortFunc={(profiles, _sortField, sortDirection) =>
    [...profiles].sort((a, b) =>
      sortDirection === "asc"
        ? (a.display_name ?? "").localeCompare(
            b.display_name ?? "",
            undefined,
            {
              numeric: true,
              sensitivity: "base",
              ignorePunctuation: true,
            },
          )
        : (b.display_name ?? "").localeCompare(
            a.display_name ?? "",
            undefined,
            {
              numeric: true,
              sensitivity: "base",
              ignorePunctuation: true,
            },
          ),
    )}
  sortFields={[{ value: "name", label: "Name" }]}
  defaultSortField="name"
  noResultsTitle={total === 0
    ? isFollowingTab
      ? profile.user_id === user?.id
        ? "Not following anyone yet"
        : `${profile.display_name} isn’t following anyone yet`
      : profile.user_id === user?.id
        ? "No followers yet"
        : `${profile.display_name} has no followers yet`
    : "No people found"}
  noResultsMessage={total === 0
    ? isFollowingTab
      ? profile.user_id === user?.id
        ? "When you follow someone, you'll see them here."
        : "When they follow someone, their connections will appear here."
      : profile.user_id === user?.id
        ? "Once someone follows you, they’ll show up here."
        : `When someone follows ${profile.display_name}, they’ll be listed here.`
    : "We couldn't find anyone matching your search. Try adjusting it or resetting to see everyone."}
  noResultsIcon={isFollowingTab ? "fa-solid fa-user" : "fa-solid fa-users"}
>
  {#snippet header()}
    <UserExploreHeader
      title={`${profile.display_name}'s Social`}
      subtitle={`${followersCount} followers ・ ${followingCount} following`}
    >
      {#snippet action()}
        <div class="join">
          <button
            type="button"
            class:btn-active={tab.current === "followers"}
            class="btn btn-sm join-item btn-ghost"
            onclick={() => setTab("followers")}
          >
            Followers
          </button>
          <button
            type="button"
            class:btn-active={isFollowingTab}
            class="btn btn-sm join-item btn-ghost"
            onclick={() => setTab("following")}
          >
            Following
          </button>
        </div>
      {/snippet}
    </UserExploreHeader>
  {/snippet}
  {#snippet renderItem(followedProfile)}
    <a
      class="group block"
      href={resolve("/(public)/user/[username]", {
        username: followedProfile.username ?? "",
      })}
    >
      <article
        class="relative overflow-hidden rounded-2xl border border-base-300 bg-base-200 p-4 shadow-sm transition hover:shadow-md"
      >
        <div class="flex items-center gap-4">
          <Avatar profile={followedProfile} imageWidth="w-16" />
          <div class="min-w-0">
            <h2 class="truncate font-semibold">
              {followedProfile.display_name}
            </h2>
            <p class="truncate text-sm text-base-content/70">
              @{followedProfile.username}
            </p>
          </div>
        </div>
      </article>
    </a>
  {/snippet}
  {#snippet noResultsAction()}
    {#if total === 0 && isFollowingTab && profile.user_id === user?.id}
      <a href={resolve("/explore/users")} class="btn btn-primary">
        Find users to follow
      </a>
    {:else if total === 0 && !isFollowingTab && profile.user_id !== user?.id}
      <FollowButton user_id={profile.user_id} {isFollowing} />
    {/if}
  {/snippet}
</ExplorePage>
