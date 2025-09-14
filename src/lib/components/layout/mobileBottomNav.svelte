<script lang="ts">
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import type { Profiles } from "../dbTableTypes";

  let { profile }: { profile: Profiles } = $props();

  const pathname = $derived(page.url.pathname);
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
  onMount(() => {
    refreshUnread();
    const onFocus = () => refreshUnread();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  });

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    // Profile: match any /user/* path
    if (href.startsWith("/user/")) return pathname.startsWith("/user/");
    return pathname === href || pathname.startsWith(href + "/");
  };
</script>

<!-- DaisyUI bottom navigation: small screens only, sticky/fixed -->
<nav class="dock bg-base-100/80 backdrop-blur md:hidden z-50">
  <a class:dock-active={isActive("/dashboard")} href="/" aria-label="Home">
    <i class="fa-solid fa-house"></i>
    <span class="dock-label">Home</span>
  </a>

  <a
    class:dock-active={isActive("/explore")}
    href="/explore"
    aria-label="Explore"
  >
    <i class="fa-solid fa-compass"></i>
    <span class="dock-label">Explore</span>
  </a>

  <a
    class:dock-active={isActive("/notifications")}
    href="/notifications"
    aria-label="Notifications"
    class="relative"
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
      <i class="fa-solid fa-bell"></i>
    </div>
    <span class="dock-label">Notifications</span>
  </a>

  <a
    class:dock-active={isActive(`/user/${profile.username}`)}
    href="/user/{profile.username}"
    aria-label="Profile"
  >
    <i class="fa-solid fa-user"></i>
    <span class="dock-label">Profile</span>
  </a>
</nav>
