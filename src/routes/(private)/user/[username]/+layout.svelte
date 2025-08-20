<script lang="ts">
  import Badge from "$lib/components/user/badge.svelte";
  import Report from "$lib/components/report/report.svelte";
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte.js";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { page } from "$app/state";
  import Avatar from "$lib/components/user/avatar.svelte";
  import ShareButton from "$lib/components/misc/shareButton.svelte";
  import FollowButton from "$lib/components/misc/followButton.svelte";

  const { data, children } = $props();
  let user = $derived(data.user);
  let profile = $derived(data.profile);
  let following = $derived(data.following);
  let meta = $derived(data.meta);

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
      : []
  );

  let openReport = $state(false);

  function toggleOpenReport() {
    openReport = !openReport;
  }

  const formattedJoinDate = $derived(formatDate(profile?.created_at));
  let activeTab = $state("Overview");

  const tabs = [
    {
      link: "",
      title: "Overview",
    },
    {
      link: "/cubes",
      title: "Cubes",
    },
    {
      link: "/achievements",
      title: "Achievements",
    },
    {
      link: "/stats",
      title: "Stats",
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
</script>

<svelte:head>
  <title>{meta.title}</title>
  <meta name="description" content={meta.description} />

  <meta property="og:title" content={meta.title} />
  <meta property="og:description" content={meta.description} />
  <meta property="og:image" content={meta.ogImage} />
  <meta property="og:url" content={meta.canonical} />
  <meta property="og:type" content="profile" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={meta.title} />
  <meta name="twitter:description" content={meta.description} />
  <meta name="twitter:image" content={meta.ogImage} />

  <link rel="canonical" href={meta.canonical} />
  <link
    rel="preload"
    as="image"
    href={meta.preloadImage}
    fetchpriority="high"
  />

  {@html `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.display_name || profile.username,
    alternateName: `@${profile.username}`,
    url: meta.canonical,
    image: meta.preloadImage,
    description: meta.description,
  })}</script>`}
</svelte:head>

<SsgoiTransition id={page.url.pathname}>
  <section class="min-h-screen px-0 py-12 pt-0">
    <div class="bg-base-200">
      <!-- Banner full width -->
      {#if profile.banner}
        <div class="relative h-48 w-full sm:h-72 md:h-80 overflow-hidden">
          <img
            src="https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_616/{profile.banner}"
            alt="{profile.username}'s banner"
            fetchpriority="high"
            class="w-full h-full object-cover object-center"
          />
          <div class="absolute inset-0 pointer-events-none"></div>
        </div>
      {:else}
        <div
          class="relative w-full h-44 sm:h-56 bg-gradient-to-tr from-primary via-secondary to-neutral"
        ></div>
      {/if}

      <div class="mx-5 lg:mx-24">
        <div
          class="flex justify-center lg:justify-between items-center mx-auto"
        >
          <div class="flex flex-col sm:flex-row w-full">
            <div
              class="flex flex-col items-center sm:items-start min-w-[120px] -mt-15 sm:-mt-32 relative"
            >
              <Avatar
                {profile}
                imgSize="size-55 sm:size-64"
                textSize="text-9xl"
              />
            </div>

            <div class="flex flex-row justify-between">
              <div class="mt-3 sm:ml-3">
                <h2
                  class="lg:flex-row flex flex-col break-all lg:items-center items-start tracking-tight gap-2"
                >
                  <div class="flex flex-col">
                    <span class="font-extrabold font-clash text-3xl sm:text-4xl"
                      >{profile.display_name}</span
                    >
                    <span>@{profile.username}</span>
                  </div>
                  <!-- Badge Section -->
                  <span class="flex flex-row gap-2">
                    <Badge {profile} textSize="sm" />
                  </span>
                </h2>

                <p class="gap-1">
                  <span class="font-semibold">Member since:</span>
                  <span class="font-mono">{formattedJoinDate}</span>
                </p>

                {#if user?.id && user.id !== profile.user_id}
                  <div class="mt-2 sm:hidden block">
                    <FollowButton
                      user_id={profile.user_id}
                      isFollowing={following.length !== 1}
                    />
                  </div>
                {/if}
              </div>

              <div class="mt-6">
                <button
                  class="btn block md:hidden"
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
          <div class="items-center justify-between gap-4 hidden md:flex">
            <ShareButton url={page.url.href} btnClass="btn btn-accent" />
            {#if user?.id === profile.user_id}
              <a
                href="/user/settings"
                class="btn btn-primary ml-4"
                aria-label="User Settings"
                title="User Settings"
              >
                <i class="fa-solid fa-gear"></i>
                <span>Settings</span>
              </a>
            {:else}
              {#if user?.id && user.id !== profile.user_id}
                <FollowButton
                  user_id={profile.user_id}
                  isFollowing={following.length !== 1}
                />
              {/if}
              <button class="btn btn-error" onclick={toggleOpenReport}>
                <i class="fa-solid fa-flag"></i>
                <span>Report</span>
              </button>
            {/if}
          </div>
        </div>
        <!-- Info & Socials right -->
        <div class="flex-1 w-full">
          <!-- Socials Section -->
          {#if socialsList.length}
            <div class="mt-4">
              <h4 class="text-lg font-bold mb-2">Socials</h4>
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

    <div
      class="flex sm:justify-center bg-base-200 w-full p-5 pt-10 gap-10 overflow-scroll md:overflow-hidden"
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
          href="/user/{profile.username}/submissions"
          class="hover:text-primary border-0 {activeTab === 'Submissions'
            ? 'border-b-4'
            : ''} border-primary"
          onclick={() => {
            activeTab = "Submissions";
          }}
          data-sveltekit-noscroll
        >
          Submissions
        </a>
      {/if}
    </div>

    {#if !profile.private || user?.id === profile.user_id}
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
</SsgoiTransition>

{#if openReport}
  <Report
    onCancel={() => (openReport = !openReport)}
    reportType="user"
    reported={profile.user_id}
    reporLabel="{profile.username}'s account"
  />
{/if}
