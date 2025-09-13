<script lang="ts">
  import { page } from "$app/state";
  import type { Profiles } from "../dbTableTypes";

  let { profile }: { profile: Profiles } = $props();

  const pathname = $derived(page.url.pathname);

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    // Profile: match any /user/* path
    if (href.startsWith("/user/")) return pathname.startsWith("/user/");
    return pathname === href || pathname.startsWith(href + "/");
  };
</script>

<!-- DaisyUI bottom navigation: small screens only, sticky/fixed -->
<nav class="dock bg-base-100/80 backdrop-blur md:hidden z-50">
  <a
    class:dock-active={isActive("/dashboard")}
    href="/"
    aria-label="Home"
  >
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
  >
    <i class="fa-solid fa-bell"></i>
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
