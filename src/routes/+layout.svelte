<script lang="ts">
  // Components and style
  import "../app.css";
  import Footer from "$lib/components/layout/footer.svelte";
  import Navbar from "$lib/components/layout/navbar.svelte";
  import { Toaster } from "svelte-sonner";
  import { SvelteKitTopLoader } from "sveltekit-top-loader";
  import { Ssgoi } from "@ssgoi/svelte";
  import { blur } from "@ssgoi/svelte/transitions";
  import { hero } from "@ssgoi/svelte/view-transitions";
  import ClientErrorReporter from "$lib/components/misc/clientErrorReporter.svelte";
  import ScrollToTop from "$lib/components/misc/scrollToTop.svelte";
  import BackButton from "$lib/components/misc/backButton.svelte";
  import MobileBottomNav from "$lib/components/layout/mobileBottomNav.svelte";

  const config = {
    defaultTransition: blur(),
    transitions: [
      {
        from: "/explore/cubes",
        to: "/explore/cubes/*",
        transition: hero(),
        symmetric: true,
      },
    ],
  };

  let { data, children } = $props();

  // Keeping user fresh in the browser
  import { invalidate } from "$app/navigation";
  import { onMount } from "svelte";

  let { session, supabase, profile, umamiTag } = $derived(data);
  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate("supabase:auth");
      }
    });
    return () => data.subscription.unsubscribe();
  });

  import { setContext } from "svelte";
  setContext("user", data.user);
  setContext("session", data.session);

  import AchievementUnlocked from "$lib/components/misc/achievementUnlocked.svelte";
  import Banner from "$lib/components/layout/banner.svelte";
</script>

<svelte:head>
  <title>CubeIndex</title>

    {#if umamiTag}
      <script
        defer
        src="https://cloud.umami.is/script.js"
        data-website-id="ae53069f-0a53-4de4-863a-5fa75c1d813f"
      ></script>
    {/if}

  <script>
    (function () {
      try {
        function apply(theme) {
          document.documentElement.dataset.theme = theme;
        }

        const mode = localStorage.getItem("themeMode");

        if (mode === "system") {
          const mql = window.matchMedia("(prefers-color-scheme: dark)");
          const setFromSystem = () => apply(mql.matches ? "dark" : "light");
          setFromSystem();
          // Keep in sync with OS changes
          mql.addEventListener("change", setFromSystem());
        } else if (mode === "manual") {
          const t = localStorage.getItem("theme") || "light";
          apply(t);
        } else {
          // Default to system if nothing set yet
          localStorage.setItem("themeMode", "system");
          const mql = window.matchMedia("(prefers-color-scheme: dark)");
          apply(mql.matches ? "dark" : "light");
        }
      } catch (e) {
        // Silently fail to avoid breaking rendering
        console.error("Error initializing theme from localStorage:", e);
      }
    })();
  </script>
</svelte:head>

<SvelteKitTopLoader color="#044eb4" showSpinner={false} shadow={false} />

<Navbar {profile} />

<Banner />

<Toaster />
<ClientErrorReporter />

<div class="pb-16 md:pb-0">
  <Ssgoi {config}>
    {@render children()}
  </Ssgoi>

  <AchievementUnlocked user={data.user} />
  <Footer />

  <BackButton />
  <ScrollToTop />
</div>

<MobileBottomNav {profile} />
