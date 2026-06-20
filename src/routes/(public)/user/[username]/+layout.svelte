<script lang="ts">
  import RoleBadge from "$lib/components/user/roleBadge.svelte";
  import Report from "$lib/components/report/report.svelte";
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte.js";
  import { page } from "$app/state";
  import Avatar from "$lib/components/user/avatar.svelte";
  import ShareButton from "$lib/components/misc/shareButton.svelte";
  import FollowButton from "$lib/components/misc/followButton.svelte";
  import UserBanner from "$lib/components/layout/userBanner.svelte";

  type ProfileTabsTitle =
    | "Collection"
    | "Statistics"
    | "Achievements"
    | "Ratings"
    | "Reviews"
    | "Social"
    | "Submissions";

  interface ProfileTabs {
    link: string;
    title: ProfileTabsTitle;
  }

  interface socialObject {
    label?: string;
    icon: string;
    bg: string;
    href: (v: string) => string;
    isImg?: boolean;
  }

  interface socialsListObject {
    [key: string]: socialObject;
  }

  const { data, children } = $props();
  const { user, profile, isFollowing, canViewProfile, stats } = $derived(data);

  const socialsMap: socialsListObject = {
    website: { icon: "fa-solid fa-globe", bg: "bg-blue-600", href: (v) => v },
    wca: {
      label: "WCA",
      icon: "/icons/WCA Logo.svg",
      bg: "bg-[#0051BA]",
      href: (v) => `https://www.worldcubeassociation.org/persons/${v}`,
      isImg: true,
    },
    discord: {
      icon: "fa-brands fa-discord",
      bg: "bg-[#5865F2]",
      href: (v) => `https://discord.com/users/${v}`,
    },
    x: {
      icon: "fa-brands fa-x-twitter",
      bg: "bg-blue-400",
      href: (v) => `https://twitter.com/${v}`,
      label: "Twitter/X",
    },
    youtube: {
      icon: "fa-brands fa-youtube",
      bg: "bg-red-600",
      href: (v) => `https://youtube.com/${v}`,
    },
    reddit: {
      icon: "fa-brands fa-reddit-alien",
      bg: "bg-orange-600",
      href: (v) => `https://reddit.com/user/${v}`,
    },
  };

  let socialsList = $derived(
    profile.socials
      ? Object.entries(profile.socials as Record<string, string>)
          .filter(([key, val]) => !!val && socialsMap[key])
          .map(([key, val]) => {
            const { icon, bg, href, isImg, label } = socialsMap[key];
            return {
              href: href(val),
              icon,
              bg,
              isImg,
              label: label ?? key[0].toUpperCase() + key.slice(1),
            };
          })
      : [],
  );

  let openReport = $state(false);

  function toggleOpenReport() {
    openReport = !openReport;
  }

  const formattedJoinDate = $derived(formatDate(profile.created_at ?? ""));
  let activeTab: ProfileTabsTitle = $state("Collection");

  const tabs: ProfileTabs[] = [
    {
      link: "/",
      title: "Collection",
    },
    {
      link: "/stats",
      title: "Statistics",
    },
    {
      link: "/achievements",
      title: "Achievements",
    },
    {
      link: "/ratings",
      title: "Ratings",
    },
    {
      link: "/reviews",
      title: "Reviews",
    },
    {
      link: "/social",
      title: "Social",
    },
  ];

  // Keep tab highlight in sync with URL
  $effect(() => {
    const path = page.url.pathname;
    const base = `/user/${profile.username}`;
    switch (path) {
      case base:
        activeTab = "Collection";
        break;
      case `${base}/achievements`:
        activeTab = "Achievements";
        break;
      case `${base}/stats`:
        activeTab = "Statistics";
        break;
      case `${base}/ratings`:
        activeTab = "Ratings";
        break;
      case `${base}/reviews`:
        activeTab = "Reviews";
        break;
      case `${base}/social`:
        activeTab = "Social";
        break;
      default:
        activeTab = "Collection";
    }
  });
</script>

<section class="min-h-screen pb-12">
  <div class="bg-base-200 pb-4">
    <UserBanner {profile} />

    <div class="mx-5 lg:mx-24">
      <div class="flex flex-wrap justify-between items-center mx-auto">
        <div class="flex justify-between mt-1 sm:mt-0">
          <div
            class="flex justify-center sm:justify-normal items-center sm:items-start -mt-5 sm:-mt-32 relative"
          >
            <Avatar {profile} imageWidth="w-25 sm:w-64" />
          </div>

          <div class="flex flex-col ml-3 sm:mt-3">
            <h2 class="flex gap-3">
              <div class="flex flex-col">
                <span class="font-extrabold font-clash text-xl sm:text-4xl">
                  {profile.display_name}
                </span>
              </div>
              <span class="flex items-center">
                <RoleBadge {profile} textSize="sm" showRoleName={true} />
              </span>
            </h2>

            <p class="text-sm sm:text-lg">
              Member since: <span class="font-mono">{formattedJoinDate}</span>
            </p>

            <div class="flex flex-wrap gap-1 items-center">
              <a href="/user/{profile.username}/social?tab=followers">
                <i class="fa-solid fa-users text-xs opacity-70"></i>
                <span class="text-sm">
                  {stats.followersCount}
                  <span class="opacity-70"> followers </span>
                </span>
              </a>

              <span class="mx-1 opacity-60" aria-hidden="true">•</span>

              <a href="/user/{profile.username}/social?tab=following">
                <span class="text-sm">
                  {stats.followingCount}
                  <span class="opacity-70"> following </span>
                </span>
              </a>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center gap-4 mt-3 md:mt-0">
          {#if user?.id && user.id !== profile.user_id}
            <FollowButton user_id={profile.user_id} {isFollowing} />
          {/if}
          <div>
            <button
              class="btn block"
              popovertarget="popover-1"
              style="anchor-name:--anchor-1"
              aria-label="User Menu"
            >
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <ul
              class="dropdown dropdown-end menu w-auto rounded-box bg-base-100 shadow-sm mt-2"
              popover
              id="popover-1"
              style="position-anchor:--anchor-1"
            >
              <div class="flex items-center">
                <ShareButton
                  url={page.url.href}
                  btnClass="btn btn-ghost w-full"
                />
              </div>
              {#if user?.id === profile.user_id}
                <a
                  href="/user/settings"
                  class="flex items-center gap-2 p-2 btn btn-ghost"
                  aria-label="User Settings"
                  title="User Settings"
                >
                  <i class="fa-solid fa-gear"></i>
                  <span>Settings</span>
                </a>
              {:else}
                <button
                  class="flex items-center gap-2 p-2 btn btn-ghost w-full"
                  onclick={toggleOpenReport}
                >
                  <i class="fa-solid fa-flag"></i>
                  <span>Report</span>
                </button>
              {/if}
            </ul>
          </div>
        </div>
      </div>

      {#if profile.bio}
        <div class="mt-4">
          {profile.bio}
        </div>
      {/if}

      <div class="flex-1 w-full">
        {#if socialsList.length}
          <div class="mt-4">
            <div class="flex flex-wrap gap-3">
              {#each socialsList as { href, icon, bg, isImg, label }}
                <a
                  {href}
                  target="_blank"
                  rel="noopener"
                  class={`flex items-center gap-2 px-4 py-2 rounded-full ${bg} hover:opacity-90 text-white font-medium shadow`}
                >
                  {#if isImg}
                    <img src={icon} alt="{label} logo" class="h-5 w-5" />
                  {:else}
                    <i class={icon}></i>
                  {/if}
                  <span class="hidden sm:inline">{label}</span>
                </a>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  {#if canViewProfile}
    <div
      class="flex sm:justify-center bg-base-200 w-full p-5 gap-10 overflow-scroll md:overflow-hidden"
    >
      {#each tabs as tab}
        <a
          href="/user/{profile.username}{tab.link}"
          class="hover:text-primary border-0 {activeTab === tab.title
            ? 'border-b-4'
            : ''} border-primary"
          onclick={() => {
            activeTab = tab.title;
          }}
          data-sveltekit-noscroll
        >
          {tab.title}
        </a>
      {/each}
      {#if user?.id === profile.user_id}
        <a
          href="/user/submissions"
          class="hover:text-primary border-0 {activeTab === 'Submissions'
            ? 'border-b-4'
            : ''} border-primary"
          onclick={() => {
            activeTab = "Submissions";
          }}
        >
          Submissions
        </a>
      {/if}
    </div>
    {@render children()}
  {:else}
    <section class="px-4 py-12 flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-3xl font-bold mb-4">This profile is private</h1>
        <p class="text-gray-400">
          You do not have permission to view this user's profile.
        </p>
      </div>
    </section>
  {/if}
</section>

{#if openReport}
  <Report
    onCancel={() => (openReport = !openReport)}
    reportType="user"
    reported={profile.user_id}
    reporLabel="{profile.username}'s account"
  />
{/if}
