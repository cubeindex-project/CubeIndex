<script lang="ts">
  import { supabase } from "$lib/supabaseClient";
  import { onMount } from "svelte";
  import ConfirmSignOut from "../user/confirmSignOut.svelte";
  import NotificationCenter from "../user/notificationCenter.svelte";
  import { blur } from "svelte/transition";
  import { themeChange } from "theme-change";
  import Tag from "../misc/tag.svelte";
  import ExplorePopover from "./ExplorePopover.svelte";

  let loading = $state(true);
  let isOpen = $state(false);
  let profile: {
    id: number;
    username: string;
    display_name: string;
    role: string;
  } | null = $state(null);
  let { session } = $props();
  let signOutConfirmation = $state(false);
  let notificationOpen = $state(false);
  
  // Utility: close all mobile-only UI bits
  function closeMobileMenus() {
    isOpen = false;
    mobileProfileDropdown = false;
  }

  async function loadProfile() {
    let { data, error: err } = await supabase
      .from("profiles")
      .select("id, username, display_name, role")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (err || !data) {
      throw new Error(err?.message ?? "Error loading profile");
    } else {
      profile = data;
    }
  }

  let notifications: any[] = $state([]);

  const navLinks = [
    { name: "Achievements", href: "/achievements" },
    { name: "About", href: "/about" },
  ];

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
  const mobileLinkBase = "block py-2 text-sm border-b border-base-300";

  onMount(() => {
    if (session) loadProfile();
    loading = false;
  });
  onMount(() => themeChange(false));

  let mobileProfileDropdown = $state(false);
  // Desktop Explore open/close management with small delay for usability
  let exploreOpen = $state(false);
  let exploreCloseTimer: ReturnType<typeof setTimeout> | null = null;
  let exploreWrapper: HTMLDivElement | null = $state(null);
  let exploreButton: HTMLAnchorElement | null = $state(null);

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
  function handleFocusOut(e: FocusEvent) {
    const next = e.relatedTarget as Node | null;
    if (exploreWrapper && next && exploreWrapper.contains(next)) return;
    scheduleCloseExplore(100);
  }

  function focusFirstExploreItem() {
    if (!exploreWrapper) return;
    const first = exploreWrapper.querySelector<HTMLAnchorElement>(
      '.dropdown-content a[href], .dropdown-content [role="menuitem"][href]'
    );
    first?.focus();
  }

  function focusLastExploreItem() {
    if (!exploreWrapper) return;
    const items = exploreWrapper.querySelectorAll<HTMLAnchorElement>(
      '.dropdown-content a[href], .dropdown-content [role="menuitem"][href]'
    );
    const last = items[items.length - 1];
    last?.focus();
  }

  function handleExploreTriggerKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      if (exploreOpen) {
        e.preventDefault();
        exploreOpen = false;
      }
      (exploreButton as HTMLAnchorElement | null)?.focus();
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openExplore();
      // Wait a tick for layout
      setTimeout(focusFirstExploreItem, 0);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      openExplore();
      setTimeout(focusFirstExploreItem, 0);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      openExplore();
      setTimeout(focusLastExploreItem, 0);
    }
  }

  function handleExploreWrapperKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      exploreOpen = false;
      (exploreButton as HTMLAnchorElement | null)?.focus();
    }
  }
</script>

<header
  class="bg-base-100/80 backdrop-blur sticky top-0 border-b border-base-300 z-20"
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
      <span class="font-clash text-3xl font-bold">CubeIndex</span>
    </a>

    <!-- Desktop Nav -->
    <nav class="hidden items-center gap-6 md:flex">
      <!-- Explore Dropdown (hover) -->
      {#key "explore-desktop"}
        <div
          class="dropdown dropdown-center"
          class:dropdown-open={exploreOpen}
          bind:this={exploreWrapper}
          onmouseenter={openExplore}
          onmouseleave={() => scheduleCloseExplore(120)}
          onfocusin={openExplore}
          onfocusout={handleFocusOut}
          onkeydown={handleExploreWrapperKeydown}
          role="dialog"
          tabindex="0"
        >
          <a
            href="#explore"
            class="inline-flex items-center gap-1.5 text-sm text-base-content/80 hover:text-base-content transition focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/30 rounded-lg px-3 py-1.5 hover:bg-base-200/60"
            id="explore-menu-button"
            aria-haspopup="menu"
            aria-expanded={exploreOpen}
            aria-controls="explore-popover"
            tabindex="0"
            bind:this={exploreButton}
            onkeydown={handleExploreTriggerKeydown}
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

      {#each navLinks as { name, href }}
        <a
          {href}
          class="text-sm text-base-content/80 hover:text-base-content transition px-2 py-1 rounded-md focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/30"
        >
          {name}
        </a>
      {/each}

      {#if loading}
        <i class="fa-solid fa-spinner animate-spin"></i>
      {:else if session && profile}
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
            {#each getProfileMenuItems(profile) as item}
              <li>
                <a
                  href={item.href}
                  class={`${desktopLinkBase} ${item.tag ? "flex justify-between" : ""}`}
                >
                  {item.label}
                  {#if item.tag}
                    <Tag label={item.tag.label} gradient={item.tag.gradient} />
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
          <!-- Notification Bell -->
          <div class="indicator" style="margin-right: 0.25rem;">
            {#if notifications.length !== 0}
              <span class="indicator-item badge badge-info badge-xs"></span>
            {/if}
            <button
              class="btn btn-ghost btn-circle btn-lg focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/30"
              aria-label="Notifications"
              onclick={() => {
                notificationOpen = !notificationOpen;
                bellAnimate = true;
              }}
            >
              <i class="fa-solid fa-bell {bellAnimate ? 'animate-ring' : ''}"
              ></i>
            </button>
          </div>
          {#if notificationOpen}
            <NotificationCenter {notificationOpen} {notifications} />
          {/if}
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
      class="btn btn-square btn-ghost md:hidden swap swap-rotate text-2xl {isOpen
        ? 'swap-active'
        : ''}"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      onclick={() => (isOpen = !isOpen)}
    >
      <i class="fa-solid fa-bars swap-off"></i>
      <i class="fa-solid fa-xmark swap-on"></i>
    </button>
  </div>

  <!-- Mobile Nav -->
  {#if isOpen}
    <nav
      class="bg-base-100/95 backdrop-blur px-6 pb-4 md:hidden absolute w-full rounded-b-4xl border-b-base-300 border-b"
      transition:blur={{ duration: 250 }}
      aria-label="Mobile navigation"
    >
      <ul class="flex flex-col gap-3">
        <!-- Explore Disclosure (mobile/touch) -->
        <li>
          <details class="group">
            <summary
              class="flex items-center justify-between cursor-pointer py-3 text-base border-b border-base-300"
            >
              <span class="inline-flex items-center gap-2 text-base-content/90">
                <i class="fa-solid fa-compass text-sm opacity-80"></i>
                Explore
              </span>
              <i
                class="fa-solid fa-caret-down group-open:rotate-180 transition-transform"
              ></i>
            </summary>
            <div class="mt-2 pl-2 flex flex-col gap-1.5">
              <a
                href="/explore/cubes"
                class="flex items-center gap-2 py-2 text-sm text-base-content/80 hover:text-base-content rounded-lg hover:bg-base-200/60 px-2"
                onclick={closeMobileMenus}
              >
                <i class="fa-solid fa-cube text-xs opacity-80"></i>
                <span>Cubes</span>
              </a>
              <span
                class="flex items-center gap-2 py-2 text-sm opacity-60 rounded-lg px-2"
                aria-disabled="true"
              >
                <i class="fa-solid fa-toolbox text-xs opacity-60"></i>
                <span>Accessories (Soon)</span>
              </span>
              <a
                href="/explore/vendors"
                class="flex items-center gap-2 py-2 text-sm text-base-content/80 hover:text-base-content rounded-lg hover:bg-base-200/60 px-2"
                onclick={closeMobileMenus}
              >
                <i class="fa-solid fa-store text-xs opacity-80"></i>
                <span>Vendors</span>
              </a>
              <a
                href="/explore/users"
                class="flex items-center gap-2 py-2 text-sm text-base-content/80 hover:text-base-content rounded-lg hover:bg-base-200/60 px-2"
                onclick={closeMobileMenus}
              >
                <i class="fa-solid fa-users text-xs opacity-80"></i>
                <span>Users</span>
              </a>
            </div>
          </details>
        </li>

        {#each navLinks as { name, href }}
          <li>
            <a
              {href}
              class="flex items-center gap-2 py-3 text-base border-b border-base-300 text-base-content/80 hover:text-base-content"
              onclick={closeMobileMenus}
            >
              <i class="fa-solid {name === 'Achievements' ? 'fa-trophy' : 'fa-circle-info'} text-xs opacity-80"></i>
              <span>{name}</span>
            </a>
          </li>
        {/each}

        <!-- Notification Bell (Mobile) -->
        <li class="relative">
          <a
            class="flex items-center w-full text-left py-3 rounded-lg hover:bg-base-200/60 transition"
            aria-label="Notifications"
            href="/notifications"
            onclick={closeMobileMenus}
          >
            <i class="fa-solid fa-bell"></i>
            <span class="ml-2 text-sm">Notifications</span>
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
              class="btn btn-primary btn-sm w-full inline-flex items-center justify-between"
            >
              <span class="inline-flex items-center gap-2">
                {profile.display_name}
              </span>
              <label class="swap swap-rotate">
                <input
                  type="checkbox"
                  bind:checked={mobileProfileDropdown}
                  hidden
                  disabled
                />

                <i class="fa-solid swap-on fa-caret-up"></i>

                <i class="fa-solid swap-off fa-caret-down"></i>
              </label>
            </button>
            {#if mobileProfileDropdown}
              <ul
                class="mt-2 flex flex-col gap-3"
                transition:blur={{ duration: 250 }}
              >
                {#each getProfileMenuItems(profile) as item}
                  <li>
                    <a
                      href={item.href}
                      onclick={() => {
                        isOpen = false;
                        mobileProfileDropdown = false;
                      }}
                      class={`${mobileLinkBase} ${item.tag ? "flex justify-between" : ""}`}
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
                      closeMobileMenus();
                    }}
                    class="py-2 text-sm border-b border-base-300 w-full justify-start flex"
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
              onclick={() => {
                isOpen = false;
                mobileProfileDropdown = false;
              }}
              class="btn btn-primary btn-sm w-full"
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
