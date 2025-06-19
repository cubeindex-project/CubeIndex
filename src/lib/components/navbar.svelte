<script lang="ts">
  import { supabase } from "$lib/supabaseClient";
  import { onMount } from "svelte";
  import ConfirmSignOut from "./confirmSignOut.svelte";
  import NotificationCenter from "./notificationCenter.svelte";
  import { blur } from "svelte/transition";
  import { themeChange } from "theme-change";

  let loading = $state(true);
  let isOpen = $state(false);
  let profile: { id: any; username: any; role: any } | null = $state(null);
  let { session } = $props();
  let signOutConfirmation = $state(false);
  let notificationOpen = $state(false);
  let mobileThemeDropdown = $state(false);

  async function loadProfile() {
    let { data, error } = await supabase
      .from("profiles")
      .select("id, username, role")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
    } else {
      profile = data;
    }
  }

  let notifications: any[] = $state([]);

  async function getMessages() {
    let { data, error } = await supabase.from("announcement").select("*");

    if (error) console.error("Error while loading announcement:", error);

		notifications = (data || []).filter(notification => notification.archived === false);
	}

  const navLinks = [
    { name: "Explore", href: "/explore" },
    { name: "Achievements", href: "/achievements" },
    { name: "About", href: "/about" },
  ];

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  let bellAnimate = $state(false);
  $effect(() => {
    if (bellAnimate) {
      setTimeout(() => (bellAnimate = false), 600);
    }
  });

  onMount(() => {
    getMessages();
    if (session) loadProfile();
    loading = false;
  });
  onMount(() => themeChange(false));

  let mobileProfileDropdown = $state(false);
</script>

<header class="bg-base-100">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-2 py-4">
		<!-- Logo -->
		<a href="/" class="flex items-center gap-2">
			<img
				src="/images/CubeIndex - Pixel Art.png"
				alt="CubeIndex logo"
				class="h-12 w-12 rounded-full"
			/>
			<span class="font-clash text-3xl font-bold">CubeIndex</span>
		</a>

    <!-- Desktop Nav -->
    <nav class="hidden items-center gap-8 md:flex">
      {#each navLinks as { name, href }}
        <a {href} class="link link-hover text-sm transition">
          {name}
        </a>
      {/each}

      <div class="relative inline-block">
        <!-- Notification Bell -->
        <button
          class="relative focus:outline-none cursor-pointer transition"
          aria-label="Notifications"
          style="margin-right: 0.5rem;"
          onclick={() => {
            notificationOpen = !notificationOpen;
            bellAnimate = true;
          }}
        >
          <i class="fa-solid fa-bell fa-xl {bellAnimate ? 'animate-ring' : ''}"
          ></i>
          {#if notifications.length !== 0}
            <div
              class="status status-info animate-ping absolute top-0 right-0"
            ></div>
            <div class="absolute top-0 right-0 status status-info"></div>
          {/if}
        </button>

        {#if notificationOpen}
          <NotificationCenter {notificationOpen} {notifications} />
        {/if}
      </div>

      <!-- Theme Switcher Dropdown -->
      <div class="dropdown dropdown-end">
        <button
          class="inline-flex cursor-pointer text-sm rounded-xl mx-2 bg-base-300"
        >
          <span class="px-4 py-2">Theme</span>
          <span class="pr-4 py-2">
            <i class="fa-solid fa-caret-down"></i>
          </span>
        </button>
        <ul
          class="dropdown-content menu bg-base-200 rounded-box z-1 w-52 p-2 mt-2 shadow-sm"
        >
          <div class="divider mt-0">Light</div>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Light"
              data-set-theme="light"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Lofi"
              data-set-theme="lofi"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Winter"
              data-set-theme="winter"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Lemonade"
              data-set-theme="lemonade"
            />
          </li>
          <div class="divider">Dark</div>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Dark"
              data-set-theme="dark"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Black"
              data-set-theme="black"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Synthwave"
              data-set-theme="synthwave"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Forest"
              data-set-theme="forest"
            />
          </li>
        </ul>
      </div>

      {#if loading}
        <i class="fa-solid fa-spinner animate-spin"></i>
      {:else if session && profile}
        <div class="dropdown dropdown-end">
          <button
            class="inline-flex items-center cursor-pointer text-sm rounded-xl bg-primary text-primary-content transition focus:outline-none"
          >
            <span class="px-4 py-2">
              {profile.username}
            </span>
            <span class="pr-4">
              <i class="fa-solid fa-caret-down"></i>
            </span>
          </button>
          <ul
            class="dropdown-content menu bg-base-300 rounded-box z-1 w-52 p-2 mt-2 shadow-sm"
          >
            <li>
              <a href={`/user/${profile.id}`} class="block px-4 py-2 text-sm">
                Profile
              </a>
            </li>
            <li>
              <a href="/user/settings" class="block px-4 py-2 text-sm">
                Settings
              </a>
            </li>
            {#if profile.role !== "User"}
              <li>
                <a href="/staff/dashboard" class="block px-4 py-2 text-sm">
                  Staff Dashboard
                </a>
              </li>
            {/if}
            <li>
              <button
                onclick={() => {
                  signOutConfirmation = true;
                }}
                class="w-full cursor-pointer text-left block px-4 py-2 text-sm"
              >
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      {:else}
        <a
          href="/auth/login"
          class="rounded-xl bg-primary text-primary-content px-4 py-2 text-sm transition"
        >
          Login
        </a>
      {/if}
    </nav>

    <!-- Mobile Menu Button -->
    <button
      onclick={() => (isOpen = !isOpen)}
      class="focus:outline-none md:hidden cursor-pointer"
      aria-label="Open menu"
    >
      <i class="fa-solid fa-bars"></i>
    </button>
  </div>

  <!-- Mobile Nav -->
  {#if isOpen}
    <nav
      class="bg-base-100 px-6 pb-4 md:hidden absolute z-20 w-full rounded-b-4xl border-b-base-300 border-b-2"
      transition:blur={{ duration: 250 }}
    >
      <ul class="flex flex-col gap-3">
        {#each navLinks as { name, href }}
          <li>
            <a
              {href}
              class="block py-2 text-sm border-b border-base-300"
              onclick={() => (isOpen = false)}
            >
              {name}
            </a>
          </li>
        {/each}

        <!-- Notification Bell (Mobile) -->
        <li class="relative">
          <a
            class="flex items-center w-full text-left py-2"
            aria-label="Notifications"
            href="/notifications"
            onclick={() => (isOpen = false)}
          >
            <i class="fa-solid fa-bell fa-xl"></i>
            <span class="ml-2">Notifications</span>
          </a>
          {#if notifications.length !== 0}
            <div
              class="status status-info animate-ping absolute top-1/2 right-2 -translate-y-1/2"
            ></div>
            <div
              class="absolute top-1/2 right-2 -translate-y-1/2 status status-info"
            ></div>
          {/if}
        </li>

        {#if session && profile}
          <li class="relative">
            <button
              onclick={() => (mobileProfileDropdown = !mobileProfileDropdown)}
              class="w-full text-center rounded-xl bg-blue-600 px-4 py-2 text-sm transition hover:bg-blue-700 focus:outline-none"
            >
              {profile.username}
              <i
                class="fa-solid {mobileProfileDropdown
                  ? 'fa-caret-up'
                  : 'fa-caret-down'}"
              ></i>
            </button>
            {#if mobileProfileDropdown}
              <ul class="mt-2 space-y-2" transition:blur={{ duration: 250 }}>
                <li>
                  <a
                    href={`/user/${profile.id}`}
                    onclick={() => (isOpen = false)}
                    class="block text-left px-4 py-2 hover:bg-neutral-800 rounded border-b border-gray-800"
                  >
                    Profile
                  </a>
                </li>
                <li>
                  <a
                    href={`/user/settings`}
                    onclick={() => (isOpen = false)}
                    class="block text-left px-4 py-2 hover:bg-neutral-800 rounded border-b border-gray-800"
                  >
                    Settings
                  </a>
                </li>
                {#if profile.role !== "User"}
                  <li>
                    <a
                      href="/staff/dashboard"
                      onclick={() => (isOpen = false)}
                      class="block text-left px-4 py-2 hover:bg-neutral-800 rounded border-b border-gray-800"
                    >
                      Staff Dashboard
                    </a>
                  </li>
                {/if}
                <li>
                  <button
                    onclick={() => {
                      signOutConfirmation = true;
                      mobileProfileDropdown = false;
                      isOpen = false;
                    }}
                    class="w-full text-left cursor-pointer block px-4 py-2 hover:bg-neutral-800 rounded"
                  >
                    Sign Out
                  </button>
                </li>
              </ul>
            {/if}
          </li>
        {:else}
          <li>
            <a
              href="/auth/login"
              onclick={() => (isOpen = false)}
              class="block rounded-xl bg-blue-600 py-2 text-center text-white transition hover:bg-blue-700"
            >
              Login
            </a>
          </li>
        {/if}
      </ul>
    </nav>
  {/if}
</header>

{#if signOutConfirmation}
  <ConfirmSignOut
    onCancel={() => {
      signOutConfirmation = false;
    }}
  />
{/if}

<style>
  @keyframes ring {
    0% {
      transform: rotate(0);
    }
    15% {
      transform: rotate(-15deg);
    }
    30% {
      transform: rotate(10deg);
    }
    45% {
      transform: rotate(-10deg);
    }
    60% {
      transform: rotate(6deg);
    }
    75% {
      transform: rotate(-4deg);
    }
    100% {
      transform: rotate(0);
    }
  }
  .animate-ring {
    animation: ring 0.6s;
  }
</style>
