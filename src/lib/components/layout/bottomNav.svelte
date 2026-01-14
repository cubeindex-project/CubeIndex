<script lang="ts">
  import { page } from "$app/state";
  import { m } from "$lib/paraglide/messages";
  import { onMount } from "svelte";
  import type { Profiles } from "../dbTableTypes";

  let { profile }: { profile: Profiles | null } = $props();

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
</script>

<nav class="dock bg-base-100/80 backdrop-blur md:hidden z-50">
  <a
    class:dock-active={pathname === "/" || pathname === "/dashboard"}
    href="/"
    aria-label={m.nav_bottom_home_aria()}
  >
    <i class="fa-solid fa-house"></i>
    <span class="dock-label">{m.nav_bottom_home_label()}</span>
  </a>

  <a
    class:dock-active={pathname.startsWith("/explore")}
    href="/explore"
    aria-label={m.nav_bottom_explore_aria()}
  >
    <i class="fa-solid fa-compass"></i>
    <span class="dock-label">{m.nav_main_explore_label()}</span>
  </a>

  <a
    class:dock-active={pathname === "/notifications"}
    href="/notifications"
    aria-label={m.nav_bottom_notifications_aria()}
    class="relative"
  >
    <div class="indicator">
      {#if profile && !isEmailVerified}
        <span
          class="indicator-item size-2 rounded-full bg-error animate-ping"
          aria-label={m.nav_notifications_verify_email_aria()}
        ></span>
        <span
          class="indicator-item size-2 rounded-full bg-error"
          aria-label={m.nav_notifications_verify_email_aria()}
        ></span>
      {:else if hasUnread}
        <span
          class="indicator-item size-2 rounded-full bg-info"
          aria-label={m.nav_notifications_unread_aria()}
        ></span>
      {/if}
      <i class="fa-solid fa-bell"></i>
    </div>
    <span class="dock-label">{m.nav_main_notifications_label()}</span>
  </a>

  {#if profile}
    <a
      class:dock-active={pathname === `/user/${profile.username}`}
      href={`/user/${profile.username}`}
      aria-label={m.nav_bottom_profile_aria()}
    >
      <i class="fa-solid fa-user"></i>
      <span class="dock-label">{m.nav_profile_menu_profile_label()}</span>
    </a>
  {:else}
    <a
      class:dock-active={pathname === "/auth/login"}
      href="/auth/login"
      aria-label={m.nav_bottom_login_aria()}
    >
      <i class="fa-solid fa-right-to-bracket"></i>
      <span class="dock-label">{m.nav_auth_login_cta()}</span>
    </a>
  {/if}
</nav>
