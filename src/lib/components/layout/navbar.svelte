<script lang="ts">
  import { getContext, onMount } from "svelte";
  import ConfirmSignOut from "../user/confirmSignOut.svelte";
  import { blur } from "svelte/transition";
  import { themeChange } from "theme-change";
  import Tag from "../misc/tag.svelte";
  import ExplorePopover from "./ExplorePopover.svelte";
  import type { User } from "@supabase/supabase-js";

  let { profile } = $props();

  let isOpen = $state(false);
  let signOutConfirmation = $state(false);
  let mobileUserMenuOpen = $state(false);
  const user = getContext<User | null>("user");

  // Utility: close all mobile-only UI bits
  function closeMobileMenus() {
    isOpen = false;
    mobileUserMenuOpen = false;
  }

  let hasUnread = $state(false);
  const isEmailVerified = $derived(profile?.verified ?? false);
  async function refreshNotifications() {
    try {
      if (!profile) {
        hasUnread = false;
        return;
      }
      const res = await fetch("/api/notifications/fetch-notifications", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        hasUnread = false;
        return;
      }
      const body = (await res.json()) as
        | { success: true; data: Array<{ read: boolean }> }
        | { success: false; error?: string };
      if ("success" in body && body.success) {
        hasUnread = body.data.some((n) => !n.read);
      } else {
        hasUnread = false;
      }
    } catch {
      hasUnread = false;
    }
  }
  onMount(() => {
    refreshNotifications();
    const onFocus = () => refreshNotifications();
    window.addEventListener("focus", onFocus);
    const t = setInterval(refreshNotifications, 60_000);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(t);
    };
  });

  interface NavLink {
    name: string;
    href: string;
    icon?: string;
    emphasis?: boolean;
    pc: boolean;
  }

  const navLinks: NavLink[] = [
    { name: "Explore", href: "/explore", icon: "fa-compass", pc: false },
    { name: "Marketplace", href: "/marketplace", icon: "fa-shop", pc: true },
    {
      name: "Awards",
      href: "/awards",
      icon: "fa-award",
      // emphasis: true,
      pc: true,
    },
  ];

  const userDisplayName = $derived(profile?.display_name);
  const email = $derived(user?.email ?? "");
  const avatarInitial = $derived(userDisplayName?.charAt(0).toUpperCase());

  let bellAnimate = $state(false);
  $effect(() => {
    if (bellAnimate) {
      setTimeout(() => (bellAnimate = false), 600);
    }
  });

  // Lock body scroll while the mobile menu is open
  $effect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  });

  /**
   * Tag metadata for a profile menu item badge.
   */
  interface ProfileMenuItemTag {
    label: string;
    gradient: string;
  }

  /**
   * Single item in the user profile dropdown menu.
   */
  interface ProfileMenuItem {
    label: string;
    href: string;
    tag?: ProfileMenuItemTag;
  }

  /**
   * Build the profile menu items consistently for desktop and mobile menus.
   */
  function getProfileMenuItems(p: {
    username: string;
    role: string;
  }): ProfileMenuItem[] {
    const items: ProfileMenuItem[] = [
      { label: "Profile", href: `/user/${p.username}` },
      { label: "Settings", href: "/user/settings" },
      {
        label: "Userbar",
        href: "/userbar",
        tag: { label: "New", gradient: "from-green-500 to-emerald-600" },
      },
    ];
    if (p.role !== "User") {
      items.push({ label: "Staff Dashboard", href: "/staff/dashboard" });
    }
    return items;
  }

  const desktopLinkBase = "block px-4 py-2 text-sm";

  onMount(() => themeChange(false));

  // Desktop Explore open/close management with small delay for usability
  let exploreOpen = $state(false);
  let exploreCloseTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Controls auto-hiding the navbar on downward scroll.
   */
  let hideNav = $state(false);
  let lastScrollY = $state(0);

  function handleScroll() {
    const y = window.scrollY || 0;
    const goingDown = y > lastScrollY;
    const threshold = 72; // px before auto-hide can kick in

    // Only auto-hide when not interacting with menus/popovers
    if (!isOpen && !exploreOpen && y > threshold && goingDown) {
      hideNav = true;
    } else {
      hideNav = false;
    }
    lastScrollY = y;
  }

  // Attach scroll listener
  $effect(() => {
    lastScrollY = window.scrollY || 0;
    const onScroll = () => handleScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  // Ensure navbar shows when menus open/close
  $effect(() => {
    if (isOpen || exploreOpen) hideNav = false;
  });

  function openExplore() {
    if (exploreCloseTimer) {
      clearTimeout(exploreCloseTimer);
      exploreCloseTimer = null;
    }
    exploreOpen = true;
  }
  function scheduleCloseExplore(delay = 150) {
    if (exploreCloseTimer) clearTimeout(exploreCloseTimer);
    exploreCloseTimer = setTimeout(() => (exploreOpen = false), delay);
  }
</script>

<header
  class="bg-base-100/80 backdrop-blur sticky top-0 border-b border-base-300 z-50 scroll-nav"
  style:transform={hideNav ? "translateY(-100%)" : "translateY(0)"}
>
  <div
    class="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6 py-3"
  >
    <!-- Logo -->
    <a
      href="/"
      class="flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/30 hover:opacity-90 transition"
      aria-label="CubeIndex Home"
    >
      <img
        src="/images/CubeIndex_Logo.webp"
        alt="CubeIndex logo"
        class="h-12 w-12 rounded-full"
        width="12"
        height="12"
        fetchpriority="high"
      />
      <span
        class="font-clash text-3xl font-bold inline-flex items-center gap-2"
      >
        CubeIndex
      </span>
    </a>

    <div class="flex items-center gap-3">
      <!-- Desktop Nav -->
      <nav class="hidden items-center gap-6 md:flex">
        <!-- Explore Dropdown (hover) -->
        {#key "explore-desktop"}
          <div
            class="dropdown dropdown-center"
            class:dropdown-open={exploreOpen}
            onmouseenter={openExplore}
            onmouseleave={() => scheduleCloseExplore(120)}
            onfocusin={openExplore}
            role="dialog"
            tabindex="0"
          >
            <a
              href="/explore"
              class="inline-flex items-center gap-1.5 text-sm text-base-content/80 hover:text-base-content transition focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/30 rounded-lg px-3 py-1.5 hover:bg-base-200/60"
              id="explore-menu-button"
              aria-haspopup="menu"
              aria-expanded={exploreOpen}
              aria-controls="explore-popover"
              tabindex="0"
            >
              Explore
              <i
                class="fa-solid fa-chevron-down transition-transform duration-200 {exploreOpen
                  ? 'rotate-180'
                  : ''}"
              ></i>
            </a>
            <div
              class="dropdown-content z-10 mt-3"
              role="menu"
              aria-labelledby="explore-menu-button"
              tabindex="-1"
            >
              {#if exploreOpen}
                <div transition:blur={{ duration: 120 }}>
                  <ExplorePopover id="explore-popover" />
                </div>
              {/if}
            </div>
          </div>
        {/key}

        {#each navLinks as link (link.href)}
          {#if link.pc}
            <a
              href={link.href}
              class={`inline-flex items-center gap-2 text-sm transition px-3 py-1.5 rounded-full focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/30 ${
                link.emphasis
                  ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-black shadow-sm hover:shadow-md"
                  : "text-base-content/80 hover:text-base-content"
              }`}
            >
              <i class={`fa-solid ${link.icon} text-xs opacity-80`}></i>
              <span class="font-medium">{link.name}</span>
            </a>
          {/if}
        {/each}

        {#if profile}
          <div class="dropdown dropdown-end">
            <button
              class="btn btn-primary btn-sm normal-case rounded-xl inline-flex items-center gap-2"
              aria-haspopup="menu"
              aria-expanded="false"
            >
              <span>{profile.display_name}</span>
              <i class="fa-solid fa-caret-down"></i>
            </button>
            <ul
              class="dropdown-content menu bg-base-300 rounded-box z-1 w-52 p-2 mt-2 shadow-sm"
            >
              {#each getProfileMenuItems(profile) as item (item.href)}
                <li>
                  <a
                    href={item.href}
                    class={`${desktopLinkBase} ${item.tag ? "flex justify-between" : ""}`}
                  >
                    {item.label}
                    {#if item.tag}
                      <Tag
                        label={item.tag.label}
                        gradient={item.tag.gradient}
                      />
                    {/if}
                  </a>
                </li>
              {/each}
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

          <div class="relative inline-block">
            <a
              href="/notifications"
              class="btn btn-ghost btn-circle btn-lg focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/30"
              aria-label="Notifications"
              onclick={() => {
                bellAnimate = true;
              }}
            >
              <div class="indicator">
                {#if profile && !isEmailVerified}
                  <span
                    class="indicator-item size-2 rounded-full bg-error animate-ping"
                    aria-label="Verify your email"
                  ></span>
                  <span
                    class="indicator-item size-2 rounded-full bg-error"
                    aria-label="Verify your email"
                  ></span>
                {:else if hasUnread}
                  <span
                    class="indicator-item size-2 rounded-full bg-info"
                    aria-label="Unread notifications"
                  ></span>
                {/if}
                <i class="fa-solid fa-bell {bellAnimate ? 'animate-ring' : ''}"
                ></i>
              </div>
            </a>
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

      {#if profile}
        <div class="relative md:hidden">
          <button
            type="button"
            class="btn btn-ghost btn-circle size-12 overflow-hidden border border-base-300"
            aria-haspopup="menu"
            aria-expanded={mobileUserMenuOpen}
            aria-controls="mobile-user-menu"
            aria-label="User menu"
            onclick={() => {
              mobileUserMenuOpen = !mobileUserMenuOpen;
              isOpen = false;
            }}
          >
            {#if profile.profile_picture}
              <img
                src={profile.profile_picture}
                alt="User avatar"
                class="size-full object-cover"
                loading="eager"
              />
            {:else}
              <div class="avatar placeholder">
                <div
                  class="bg-base-300 text-base-content size-full rounded-full"
                >
                  <span class="text-sm font-semibold">{avatarInitial}</span>
                </div>
              </div>
            {/if}
          </button>

          {#if mobileUserMenuOpen}
            <div
              class="absolute right-0 mt-3 w-64 rounded-2xl border border-base-300 bg-base-100 shadow-lg"
              role="menu"
              aria-label="User menu"
              id="mobile-user-menu"
              tabindex="-1"
            >
              <div class="px-4 py-3 border-b border-base-300">
                <p class="text-sm font-semibold leading-tight">
                  {userDisplayName}
                </p>
                <p class="text-xs text-base-content/70 mt-1">
                  {email}
                </p>
              </div>
              <div class="flex flex-col px-2 py-1">
                <a
                  href="/user/settings"
                  class="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-base-200 focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/30"
                  data-menu-focus-target
                  onclick={() => (mobileUserMenuOpen = false)}
                >
                  <span>Settings</span>
                  <i class="fa-solid fa-gear text-xs opacity-70"></i>
                </a>
                {#if profile.role !== "User"}
                  <a
                    href="/staff/dashboard"
                    class="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-base-200 focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/30"
                    onclick={() => (mobileUserMenuOpen = false)}
                  >
                    <span>Staff dashboard</span>
                    <i class="fa-solid fa-gauge-high text-xs opacity-70"></i>
                  </a>
                {/if}
                <button
                  type="button"
                  class="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-error hover:bg-base-200 focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/30"
                  onclick={() => {
                    signOutConfirmation = true;
                    mobileUserMenuOpen = false;
                  }}
                >
                  <span>Log out</span>
                  <i
                    class="fa-solid fa-arrow-right-from-bracket text-xs opacity-70"
                  ></i>
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</header>

{#if signOutConfirmation}
  <ConfirmSignOut
    onCancel={() => {
      signOutConfirmation = false;
    }}
  />
{/if}

<style>
  .scroll-nav {
    transition: transform 200ms ease;
    will-change: transform;
  }
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
