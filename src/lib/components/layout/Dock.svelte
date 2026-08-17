<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";

  const navigation = [
    {
      title: "Home",
      icon: "fa-solid fa-house",
      link: resolve("/"),
    },
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
      title: "Achievements",
      icon: "fa-solid fa-trophy",
      link: resolve("/(public)/explore/achievements"),
      hidden: true,
    },
    {
      title: "Awards",
      icon: "fa-solid fa-award",
      link: resolve("/(public)/awards"),
      hidden: true,
    },
  ];

  const activeTab = $derived.by(() => {
    if (page.url.pathname === "/" || page.url.pathname === "/dashboard") {
      return "Home";
    } else if (page.url.pathname === "/explore/cubes") {
      return "Cubes";
    } else if (page.url.pathname === "/explore/vendors") {
      return "Stores";
    } else if (page.url.pathname === "/explore/users") {
      return "Users";
    }
  });
</script>

<nav class="dock bg-base-100/90 backdrop-blur-xl lg:hidden">
  {#each navigation as nav, index (index)}
    {#if !nav.hidden}
      {#if nav.link}
        <a href={nav.link} class:dock-active={activeTab === nav.title}>
          <i class={nav.icon}></i>
          <span class="dock-label">{nav.title}</span>
        </a>
        <!-- {:else if nav.subMenu}
        <details class="dropdown dropdown-top dropdown-center">
          <summary
            class="flex h-full w-full cursor-pointer list-none flex-col items-center justify-center gap-px"
          >
            <i class={nav.icon}></i>
            <span class="dock-label">{nav.title}</span>
          </summary>
          <ul
            class="menu dropdown-content bg-base-100 rounded-box z-999 mb-2 w-52 p-2 shadow-sm"
          >
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
    {/if}
  {/each}
</nav>
