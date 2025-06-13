<script lang="ts">
  // Components and style
  import "../app.css";
  import Navbar from "$lib/components/navbar.svelte";
  import Footer from "$lib/components/footer.svelte";
  import Disclaimer from "$lib/components/disclaimer.svelte";
  import { Toaster } from "svelte-sonner";

  let { data, children } = $props();

  // Vercel's Analytics and Speed Insights
  import { injectAnalytics } from "@vercel/analytics/sveltekit";
  import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
  import { UmamiAnalyticsEnv } from "@lukulent/svelte-umami";

  injectAnalytics();
  injectSpeedInsights();

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
</script>

<svelte:head>
  <script>
    (function () {
      try {
        const t = localStorage.getItem("theme");
        if (t) document.documentElement.dataset.theme = t;
      } catch {}
    })();
  </script>
</svelte:head>

<UmamiAnalyticsEnv />

<Disclaimer />

<Navbar session={data.session} />

<Toaster />

<section class="bg-base-100">
  {@render children()}
</section>

<Footer />
