<script lang="ts">
  // Components and style
  import "../app.css";
  import Navbar from "$lib/components/layout/navbar.svelte";
  import { Toaster } from "svelte-sonner";
  import { SvelteKitTopLoader } from "sveltekit-top-loader";
  import ClientErrorReporter from "$lib/components/misc/clientErrorReporter.svelte";
  import ScrollToTop from "$lib/components/misc/scrollToTop.svelte";
  import BottomNav from "$lib/components/layout/bottomNav.svelte";
  import type { ResolvedMeta } from "$lib/types/meta";
  import { page } from "$app/state";

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

  import Banner from "$lib/components/layout/banner.svelte";
  import Footer from "$lib/components/layout/footer.svelte";

  const meta: ResolvedMeta = $derived.by(() => ({
    ...data.meta,
    ...(page.data.meta ?? {}),
  }));

  const ogTitle = $derived(meta.ogTitle ?? meta.title);
  const ogDescription = $derived(meta.ogDescription ?? meta.description);
  const twitterTitle = $derived(meta.twitterTitle ?? meta.title);
  const twitterDescription = $derived(
    meta.twitterDescription ?? meta.description,
  );
  const twitterImage = $derived(meta.twitterImage ?? meta.image);
</script>

<svelte:head>
  <title>{meta.title}</title>
  <meta name="description" content={meta.description} />
  <link rel="canonical" href={meta.canonical} />

  {#if meta.jsonLd}
    {@html `<script type="application/ld+json">${JSON.stringify(meta.jsonLd).replace(/</g, "\\u003c")}</script>`}
  {/if}

  <meta property="og:title" content={ogTitle} />
  <meta property="og:site_name" content={meta.siteName} />
  <meta property="og:image" content={meta.image} />
  <meta property="og:description" content={ogDescription} />
  <meta property="og:url" content={meta.url} />

  <meta property="twitter:title" content={twitterTitle} />
  <meta property="twitter:image" content={twitterImage} />
  <meta property="twitter:description" content={twitterDescription} />
  <meta property="twitter:card" content={meta.twitterCard} />

  <meta name="google-site-verification" content={meta.googleSiteVerification} />

  {#if meta.noindex}
    <meta name="robots" content="noindex" />
  {/if}

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
  {@render children()}

  <div class="hidden md:block">
    <Footer />
  </div>

  <ScrollToTop />
</div>

<BottomNav {profile} />
