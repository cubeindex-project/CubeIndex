<script lang="ts">
  // Components and style
  import "../app.css";
  import Footer from "$lib/components/layout/footer.svelte";
  import Navbar from "$lib/components/layout/navbar.svelte";
  import Disclaimer from "$lib/components/layout/disclaimer.svelte";
  import { Toaster } from "svelte-sonner";
  import { SvelteKitTopLoader } from "sveltekit-top-loader";
  import { Ssgoi } from "@ssgoi/svelte";
  import { blur } from "@ssgoi/svelte/transitions";
  import { hero } from "@ssgoi/svelte/view-transitions";
  import { developerMode } from "$lib/stores/debug";

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

  import { UmamiAnalyticsEnv } from "@lukulent/svelte-umami";

  // Keeping user fresh in the browser
  import { invalidate } from "$app/navigation";
  import { onMount } from "svelte";

  let { session, supabase } = $derived(data);
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
</script>

<svelte:head>
  <script>
    (function () {
      try {
        const t = localStorage.getItem("theme");
        if (t) {
          document.documentElement.dataset.theme = t;
        } else {
          localStorage.setItem("theme", "dark");
        }
      } catch (e) {
        console.error("Error initializing theme from localStorage:", e);
      }
    })();
  </script>
</svelte:head>

<UmamiAnalyticsEnv />

<SvelteKitTopLoader color="#044eb4" showSpinner={false} shadow={false} />

<Disclaimer />

<Navbar session={data.session} />

<Toaster />

<Ssgoi {config}>
  <section class="bg-base-100 relative">
    {@render children()}
  </section>
</Ssgoi>

<Footer />

{#if $developerMode}
  <div class="fixed bottom-4 right-4 bg-red-600 text-white text-sm px-3 py-2 rounded z-50">
    Debugging mode active
  </div>
{/if}
