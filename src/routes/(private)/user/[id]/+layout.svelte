<script lang="ts">
  import Badge from "$lib/components/user/badge.svelte";
  import { onMount } from "svelte";

  const { data, children } = $props();
  const { user, profile } = data;

  function formatJoinDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  const formattedJoinDate = formatJoinDate(profile?.created_at);
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
      link: "/reviews",
      title: "Reviews",
    },
    {
      link: "/social",
      title: "Social",
    },
  ];
</script>

<section class="min-h-screen px-0 py-12 pt-0">
  <div class="bg-base-200">
    <!-- Banner full width -->
    {#if profile.banner}
      <div class="relative h-48 w-full sm:h-72 md:h-80 overflow-hidden">
        <img
          src={profile.banner}
          alt="{profile.username}'s banner"
          class="w-full h-full object-cover object-center transition-transform duration-300"
          loading="lazy"
        />
        <div class="absolute inset-0 pointer-events-none"></div>
      </div>
    {:else}
      <div
        class="relative w-full h-44 sm:h-56 bg-gradient-to-tr from-primary via-secondary to-neutral"
      ></div>
    {/if}

    <div class="relative max-w-4xl mx-auto -mt-24 px-4">
      <div
        class="bg-base-300 rounded-2xl px-4 sm:px-10 py-10 flex flex-col sm:flex-row items-center gap-8"
      >
        <!-- Avatar left -->
        {#if profile.profile_picture}
          <div class="flex flex-col items-center sm:items-start min-w-[120px]">
            <img
              src={profile.profile_picture}
              alt="Avatar"
              class="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-primary shadow-xl bg-black object-cover transition-transform duration-200"
            />
          </div>
        {:else}
          <div class="avatar avatar-placeholder">
            <div
              class="bg-base-300 w-32 h-32 rounded-full border-4 border-primary"
            >
              <span class="text-5xl uppercase font-clash"
                >{profile.username.charAt(0)}</span
              >
            </div>
          </div>
        {/if}
        <!-- Info & Socials right -->
        <div class="flex-1 w-full">
          <div class="flex justify-between w-full gap-2 items-center">
            <h2
              class="text-3xl sm:text-4xl md:flex-row flex flex-col font-extrabold gap-4 break-all sm:items-center items-start tracking-tight"
            >
              <span class="font-clash">{profile.username}</span>
              <!-- Badge Section -->
              <span class="flex flex-row gap-2">
                <Badge {profile} textSize="sm" />
              </span>
            </h2>
            {#if user?.id === profile.user_id}
              <a
                href="/user/settings"
                class="btn btn-lg btn-primary ml-4 hidden md:flex"
                aria-label="User Settings"
                title="User Settings"
              >
                <i class="fa-solid fa-gear"></i>
                <span>Settings</span>
              </a>
            {:else}
              <button class="btn btn-error hidden md:flex" disabled>
                <i class="fa-solid fa-flag"></i>
                <span>Report</span>
              </button>
            {/if}
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
              {#if user?.id === profile.user_id}
                <a
                  href="/user/settings"
                  class="flex justify-end items-center gap-2 p-2"
                  aria-label="User Settings"
                  title="User Settings"
                >
                  <i class="fa-solid fa-gear"></i>
                  <span>Settings</span>
                </a>
              {:else}
                <button
                  class="flex justify-end items-center gap-2 p-2"
                  disabled
                >
                  <i class="fa-solid fa-flag"></i>
                  <span>Report</span>
                </button>
              {/if}
            </ul>
          </div>
          <p class="mt-2">
            Member since: <span class="font-mono">{formattedJoinDate}</span>
          </p>

          <!-- Bio (no card, just text, spaced below join date) -->
          <div class="mt-3 mb-4">
            <h4 class="text-lg font-bold mb-1">Bio</h4>
            <p class="break-words">
              {profile?.bio || "No bio provided."}
            </p>
          </div>

          <!-- Socials Section -->
          {#if profile.socials}
            <div class="mt-4">
              <h4 class="text-lg font-bold mb-2">Socials</h4>
              <div class="flex flex-wrap items-center gap-3">
                {#if profile.socials.website}
                  <a
                    href={`${profile.socials.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow transition"
                    aria-label="Website"
                  >
                    <i class="fa-solid fa-globe"></i>
                    <span class="hidden sm:inline">Website</span>
                  </a>
                {/if}
                {#if profile.socials.wca}
                  <a
                    href={`https://www.worldcubeassociation.org/persons/${profile.socials.wca}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0051BA] hover:bg-[#003f94] text-white font-medium shadow transition"
                    aria-label="Youtube"
                  >
                    <img
                      src="/icons/WCA Logo.svg"
                      alt="WCA Logo"
                      class="h-5 w-5"
                    />
                    <span class="hidden sm:inline">WCA</span>
                  </a>
                {/if}
                {#if profile.socials.instagram}
                  <a
                    href={`https://www.instagram.com/${profile.socials.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-medium shadow transition"
                    aria-label="Instagram"
                  >
                    <i class="fa-brands fa-instagram"></i>
                    <span class="hidden sm:inline">Instagram</span>
                  </a>
                {/if}
                {#if profile.socials.discord}
                  <a
                    href={`https://discord.com/users/${profile.socials.discord}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-[#5865F2] hover:bg-[#4855c8] text-white font-medium shadow transition"
                    aria-label="Discord"
                  >
                    <i class="fa-brands fa-discord"></i>
                    <span class="hidden sm:inline">Discord</span>
                  </a>
                {/if}
                {#if profile.socials.x}
                  <a
                    href={`https://twitter.com/${profile.socials.x}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-400 hover:bg-blue-500 text-white font-medium shadow transition"
                    aria-label="Twitter"
                  >
                    <i class="fa-brands fa-x-twitter"></i>
                    <span class="hidden sm:inline">Twitter/X</span>
                  </a>
                {/if}
                {#if profile.socials.youtube}
                  <a
                    href={`https://www.youtube.com/${profile.socials.youtube}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium shadow transition"
                    aria-label="Youtube"
                  >
                    <i class="fa-brands fa-youtube"></i>
                    <span class="hidden sm:inline">Youtube</span>
                  </a>
                {/if}
                {#if profile.socials.reddit}
                  <a
                    href={`https://www.reddit.com/user/${profile.socials.reddit}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-medium shadow transition"
                    aria-label="Youtube"
                  >
                    <i class="fa-brands fa-reddit-alien"></i>
                    <span class="hidden sm:inline">Reddit</span>
                  </a>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <div
    class="flex sm:justify-center bg-base-200 w-full p-5 pt-10 gap-10 overflow-scroll md:overflow-hidden"
  >
    {#each tabs as tab}
      <a
        href="/user/{profile.id}{tab.link}"
        class="hover:text-primary border-0 {activeTab === tab.title
          ? 'border-b-4'
          : ''} border-primary"
        onclick={() => {
          activeTab = tab.title;
        }}>{tab.title}</a
      >
    {/each}
    {#if user?.id === profile.user_id}
      <a
        href="/user/{profile.id}/submissions"
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
