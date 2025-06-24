<script lang="ts">
  // Components and style
  import "../app.css";
  import Navbar from "$lib/components/navbar.svelte";
  import Footer from "$lib/components/footer.svelte";
  import Disclaimer from "$lib/components/disclaimer.svelte";
  import { Toaster } from "svelte-sonner";
  import { SvelteKitTopLoader } from 'sveltekit-top-loader';

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
  setContext('user', () => data.user);
  setContext('session', () => data.session)
</script>

<svelte:head>
  <script>
    (function () {
      try {
        const t = localStorage.getItem("theme");
        if (t) document.documentElement.dataset.theme = t;
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

<section class="bg-base-100">
  {@render children()}
</section>

<Footer />
