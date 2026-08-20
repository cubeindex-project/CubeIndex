<script lang="ts">
  import { resolve } from "$app/paths";
  import type { Tables } from "$lib/types/database.types";
  import { onMount } from "svelte";
  import ConfirmSignOut from "../user/ConfirmSignOut.svelte";

  interface Props {
    profile: Pick<
      Tables<"profiles">,
      "profile_picture" | "username" | "role" | "verified"
    > | null;
  }

  const { profile }: Props = $props();

  const navigation = [
    {
      title: "Cubes",
      icon: "fa-solid fa-cube",
      link: resolve("/(public)/explore/cubes"),
    },
    {
      title: "Stores",
      icon: "fa-solid fa-store",
      link: resolve("/(public)/explore/vendors"),
    },
    {
      title: "Users",
      icon: "fa-solid fa-users",
      link: resolve("/(public)/explore/users"),
    },
    {
      title: "CubingAtlas",
      icon: "fa-solid fa-book-atlas",
      link: "https://atlas.thecubeindex.com",
      external: true,
    },
    // {
    //   title: "Achievements",
    //   icon: "fa-solid fa-trophy",
    //   link: resolve("/(public)/explore/achievements"),
    //   hidden: true,
    // },
    // {
    //   title: "Awards",
    //   icon: "fa-solid fa-award",
    //   link: resolve("/(public)/awards"),
    //   hidden: true,
    // },
    // {
    //   title: "About",
    //   icon: "fa-solid fa-circle-info",
    //   link: resolve("/(public)/about"),
    //   hidden: true,
    // },
  ];

  let isSigningOut = $state(false);

  const isEmailVerified = $derived(profile?.verified ?? false);
  let hasUnread = $state(false);
  async function refreshUnread() {
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

  let isBellClicked = $state(false);
  $effect(() => {
    if (!isBellClicked) return;
    const timeout = setTimeout(() => (isBellClicked = false), 600);
    return () => clearTimeout(timeout);
  });

  onMount(() => {
    refreshUnread();
    const onFocus = () => refreshUnread();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  });
</script>

<header
  class="sticky top-0 z-50 border-b border-base-300 bg-base-100/90 backdrop-blur-xl"
>
  <nav class="navbar mx-auto min-h-16 max-w-7xl px-4 lg:px-6">
    <div class="navbar-start gap-6">
      <div class="flex items-center gap-2">
        <a class="flex items-center space-x-3" href={resolve("/")}>
          <img
            class="size-10 rounded-xl"
            src="/images/CubeIndex_Logo.webp"
            alt="CubeIndex's Logo"
          />
          <span class="font-clash text-2xl sm:text-3xl">CubeIndex</span>
        </a>
      </div>

      <div class="hidden flex-none lg:flex">
        <ul class="menu menu-horizontal gap-1 px-0">
          {#each navigation as nav, index (index)}
            <!-- {#if !nav.hidden} -->
            <li>
              {#if nav.link}
                <a href={nav.link} rel="external">
                  <i class={nav.icon}></i>
                  {nav.title}
                  {#if nav.external}
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                  {/if}
                </a>
                <!-- {:else if nav.subMenu}
                  <details>
                    <summary>
                      <i class={nav.icon}></i>
                      {nav.title}
                    </summary>
                    <ul>
                      {#each nav.subMenu as subMenu, index (index)}
                        {#if !subMenu.hidden}
                          <li>
                            <a href={subMenu.link}>
                              <i class={subMenu.icon}></i>
                              {subMenu.title}
                            </a>
                          </li>
                        {/if}
                      {/each}
                    </ul>
                  </details> -->
              {/if}
            </li>
            <!-- {/if} -->
          {/each}
        </ul>
      </div>
    </div>
    <div class="navbar-end space-x-4">
      {#if profile}
        <!-- <a
          class="btn btn-primary btn-sm hidden sm:inline-flex"
          href={resolve("/(private)/submit")}
        >
          <i class="fa-solid fa-plus"></i>
          Submit cube
        </a> -->
        <a
          class="notification-button"
          href={resolve("/(private)/notifications")}
          aria-label="Notifications"
          onclick={() => (isBellClicked = true)}
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
            <i
              class="fa-solid fa-bell text-xl"
              class:animate-bell={isBellClicked}
            ></i>
          </div>
        </a>
        <div class="dropdown dropdown-end">
          <div
            tabindex="0"
            role="button"
            class="btn btn-ghost btn-circle avatar size-12"
            aria-label="Open {profile.username}'s account menu"
          >
            <div class="rounded-full">
              <img src={profile.profile_picture} alt="" />
            </div>
          </div>
          <ul
            tabindex="-1"
            class="menu dropdown-content z-1 mt-3 w-60 bg-base-100 rounded-box p-2 shadow-xl"
          >
            <li class="menu-title normal-case">
              <span class="truncate text-sm text-base-content">
                @{profile.username}
              </span>
            </li>
            <li>
              <a
                href={resolve("/(public)/user/[username]", {
                  // Temporary fix
                  username: profile.username ?? "",
                })}
              >
                <i class="fa-solid fa-circle-user"></i>
                Profile
              </a>
            </li>
            <li>
              <a href={resolve("/(private)/user/settings")}>
                <i class="fa-solid fa-gear"></i>
                Settings
              </a>
            </li>
            <li>
              <a href={resolve("/(private)/user/submissions")}>
                <i class="fa-solid fa-paper-plane"></i>
                Submissions
              </a>
            </li>
            <li>
              <a href={resolve("/(private)/userbar")}>
                <i class="fa-solid fa-id-card"></i>
                Userbar
              </a>
            </li>
            {#if profile.role !== "User"}
              <li>
                <a href={resolve("/(admin)/staff/dashboard")}>
                  <i class="fa-solid fa-clipboard-user"></i>
                  Staff Dashboard
                </a>
              </li>
            {:else}
              <li>
                <a href={resolve("/(public)/apply")}>
                  <i class="fa-solid fa-clipboard-user"></i>
                  Apply for staff
                </a>
              </li>
            {/if}
            <li>
              <button
                type="button"
                class="text-error"
                onclick={() => (isSigningOut = true)}
              >
                <i class="fa-solid fa-arrow-right-from-bracket"></i>
                Logout
              </button>
            </li>
          </ul>
        </div>
      {:else}
        <a
          class="btn btn-ghost btn-sm sm:btn-md"
          href={resolve("/(auth)/auth/login")}>Log In</a
        >
        <a
          class="btn btn-primary btn-sm sm:btn-md"
          href={resolve("/(auth)/auth/signup")}
        >
          Sign Up
        </a>
      {/if}
    </div>
  </nav>
</header>

<ConfirmSignOut bind:open={isSigningOut} />

<style>
  .animate-bell {
    animation: shake 0.6s ease-in-out;
    transform-origin: top center;
  }

  @keyframes shake {
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

  @media (prefers-reduced-motion: reduce) {
    .animate-bell {
      animation: none;
    }
  }
</style>
