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
  import ClientErrorReporter from "$lib/components/misc/clientErrorReporter.svelte";

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

  import { pwaInfo } from "virtual:pwa-info";

  const webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : "";

  import { registerSW } from "virtual:pwa-register";
  registerSW({ immediate: true });
</script>

<svelte:head>
  {@html webManifest}

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
        throw new Error("Error initializing theme from localStorage:" + e);
      }
    })();
  </script>
</svelte:head>

<UmamiAnalyticsEnv />

<SvelteKitTopLoader color="#044eb4" showSpinner={false} shadow={false} />

<Disclaimer />

<Navbar session={data.session} />

<Toaster />
<ClientErrorReporter />

<Ssgoi {config}>
  <section class="bg-base-100 relative">
    {@render children()}
  </section>
</Ssgoi>

{#await import("$lib/components/misc/reloadPrompt.svelte") then { default: ReloadPrompt }}
  <ReloadPrompt />
{/await}

<Footer />
