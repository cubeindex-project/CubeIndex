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

  let { session, supabase, profile } = $derived(data);
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

  import { pwaInfo } from "virtual:pwa-info";
  import AchievementUnlocked from "$lib/components/misc/achievementUnlocked.svelte";

  const webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : "";
</script>

<svelte:head>
  {@html webManifest}

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

<Toaster />
<ClientErrorReporter />

<Ssgoi {config}>
  <section class="bg-base-100 relative">
    {@render children()}
  </section>
</Ssgoi>

<AchievementUnlocked user={data.user} />

{#await import("$lib/components/misc/reloadPrompt.svelte") then { default: ReloadPrompt }}
  <ReloadPrompt />
{/await}

<Footer />

<BackButton />
<ScrollToTop />
