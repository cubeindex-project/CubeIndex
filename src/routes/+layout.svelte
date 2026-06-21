<script lang="ts">
  // Components and style
  import "../app.css";
  import Navbar from "$lib/components/layout/navbar.svelte";
  import { Toaster } from "svelte-sonner";
  import { SvelteKitTopLoader } from "sveltekit-top-loader";
  import ClientErrorReporter from "$lib/components/misc/clientErrorReporter.svelte";
  import ScrollToTop from "$lib/components/misc/scrollToTop.svelte";
  import BottomNav from "$lib/components/layout/bottomNav.svelte";
  import type { ResolvedMeta } from "$lib/types/meta.types";
  import { page } from "$app/state";

  let { data, children } = $props();

  // Keeping user fresh in the browser
  import { invalidate } from "$app/navigation";
  import { onMount } from "svelte";

  let { session, supabase, profile, isDevelopmentEnvironment } = $derived(data);
  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate("supabase:auth");
      }
    });
    return () => data.subscription.unsubscribe();
  });

  import Banner from "$lib/components/layout/banner.svelte";
  import Footer from "$lib/components/layout/footer.svelte";

  const meta: ResolvedMeta = $derived.by(() => {
    const pageMeta = page.data.meta;

    const title = pageMeta?.title ?? "CubeIndex";
    const description =
      pageMeta?.description ??
      "Discover, track, and rate your speedcubes. CubeIndex is the all-in-one database for cubers.";
    const image =
      pageMeta?.image ?? page.url.origin + "/images/og/cubeindex-og.png";

    return {
      title,
      description,
      ogTitle: pageMeta?.ogTitle ?? title,
      ogDescription: pageMeta?.ogDescription ?? description,
      siteName: pageMeta?.siteName ?? "CubeIndex",
      image,
      url: pageMeta?.url ?? page.url.href,
      twitterTitle: pageMeta?.twitterTitle ?? title,
      twitterDescription: pageMeta?.twitterDescription ?? description,
      twitterImage:
        pageMeta?.twitterImage ??
        page.url.origin + "/images/og/cubeindex-twitter-og.png",
      twitterCard: pageMeta?.twitterCard ?? "summary_large_image",
      jsonLd: pageMeta?.jsonLd ?? {
        "@context": "https://schema.org",
        "@type": "Organization",
        url: page.url.origin,
        logo: page.url.origin + "/images/CubeIndex_Logo.webp",
        name: "CubeIndex",
        description:
          "Discover, track, and rate your speedcubes. CubeIndex is the all-in-one database for cubers.",
        email: "thecubeindex@gmail.com",
      },
      noindex: pageMeta?.noindex ?? false,
      canonical: pageMeta?.canonical ?? page.url.href,
    };
  });
</script>

<svelte:head>
  <title>{meta.title}</title>
  <meta name="description" content={meta.description} />
  <link rel="canonical" href={meta.canonical} />

  {#if meta.jsonLd}
    {@html `<script type="application/ld+json">${JSON.stringify(meta.jsonLd).replace(/</g, "\\u003c")}</script>`}
  {/if}

  <meta property="og:title" content={meta.ogTitle} />
  <meta property="og:site_name" content={meta.siteName} />
  <meta property="og:image" content={meta.image} />
  <meta property="og:description" content={meta.ogDescription} />
  <meta property="og:url" content={meta.url} />

  <meta name="twitter:title" content={meta.twitterTitle} />
  <meta name="twitter:image" content={meta.twitterImage} />
  <meta name="twitter:description" content={meta.twitterDescription} />
  <meta name="twitter:card" content={meta.twitterCard} />

  {#if meta.noindex}
    <meta name="robots" content="noindex" />
  {/if}

  {#if isDevelopmentEnvironment}
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
          mql.addEventListener("change", setFromSystem);
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
