<script lang="ts">
  import FollowButton from "$lib/components/misc/followButton.svelte";
  import Avatar from "$lib/components/user/avatar.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { profile, user, followers, following, isFollowing } = data;

  let tab: string = $state("following");
</script>

<div class="max-w-6xl mx-auto mt-12 px-4 flex">
  <div class="flex flex-col lg:flex-row gap-6">
    <ul
      class="menu menu-vertical w-fit p-4 gap-5 flex-col flex overflow-hidden"
    >
      <li>
        <button
          class="tab tab-lg justify-start flex gap-2"
          class:menu-active={tab === "following"}
          onclick={() => (tab = "following")}
        >
          Following
        </button>
      </li>
      <li>
        <button
          class="tab tab-lg justify-start flex gap-2"
          class:menu-active={tab === "followers"}
          onclick={() => (tab = "followers")}
        >
          Followers
        </button>
      </li>
    </ul>
  </div>

  <!-- Main Content -->
  <main class="flex-1 overflow-y-auto px-8">
    {#if tab === "following"}
      <div class="flex flex-wrap gap-6">
        {#each following as f}
          <a class="flex flex-col items-center" href="/user/{f.username}">
            <Avatar profile={f} size="md" />
            <span class="text-sm">{f.display_name}</span>
          </a>
        {:else}
          <div
            class="w-full flex flex-col items-center justify-center py-16 text-center"
          >
            <div class="text-5xl mb-4">
              <i class="fa-solid fa-user"></i>
            </div>
            <h2 class="text-xl font-semibold mb-2">
              {#if profile.user_id === user?.id}
                Not following anyone yet
              {:else}
                {profile.display_name} isn’t following anyone yet
              {/if}
            </h2>
            <p class="text-base mb-4">
              {#if profile.user_id === user?.id}
                When you follow someone, you'll see them here.
              {:else}
                When they follow someone, their connections will appear here.
              {/if}
            </p>
            {#if profile.user_id === user?.id}
              <a href="/explore/users" class="btn btn-primary">
                Find users to follow
              </a>
            {/if}
          </div>
        {/each}
      </div>
    {:else if tab === "followers"}
      <div class="flex flex-wrap gap-6">
        {#each followers as f}
          <a class="flex flex-col items-center" href="/user/{f.username}">
            <Avatar profile={f} size="md" />
            <span class="text-sm">{f.display_name}</span>
          </a>
        {:else}
          <div
            class="w-full flex flex-col items-center justify-center py-16 text-center"
          >
            <div class="text-5xl mb-4">
              <i class="fa-solid fa-users"></i>
            </div>
            <h2 class="text-xl font-semibold mb-2">
              {#if profile.user_id === user?.id}
                No followers yet
              {:else}
                {profile.display_name} has no followers yet
              {/if}
            </h2>
            <p class="text-base opacity-70 mb-4">
              {#if profile.user_id === user?.id}
                Once someone follows you, they’ll show up here.
              {:else}
                When someone follows {profile.display_name}, they’ll be listed
                here.
              {/if}
            </p>
            {#if profile.user_id !== user?.id}
              <FollowButton user_id={profile.user_id} {isFollowing} />
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </main>
</div>
