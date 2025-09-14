<script lang="ts">
import { PUBLIC_KOFI_URL } from "$env/static/public";
  const kofiUrl = PUBLIC_KOFI_URL || "https://ko-fi.com/";
  const displayUrl = (u: string) => u.replace(/^https?:\/\//, "");
</script>

<svelte:head>
  <title>Support CubeIndex</title>
  <meta
    name="description"
    content="CubeIndex is free. If you’d like to support development and hosting, you can do so on Ko‑fi."
  />
</svelte:head>

<section class="relative">
  <div
    class="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent"
  ></div>
  <div class="mx-auto max-w-3xl px-4 md:px-6 py-16 md:py-24 text-center">
    <h1 class="font-clash text-4xl md:text-6xl font-extrabold tracking-tight">
      CubeIndex is free — support us on Ko‑fi
    </h1>
    <p class="mt-4 text-base-content/70 text-lg">
      If CubeIndex is helpful and you want to chip in for hosting and ongoing
      development, a small Ko‑fi goes a long way.
    </p>

    <div class="mt-8 flex justify-center">
      <a
        href={kofiUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-primary btn-lg rounded-2xl inline-flex items-center gap-3"
      >
        <i class="fa-solid fa-mug-hot"></i>
        <span>Support on Ko‑fi</span>
      </a>
    </div>

    <p class="mt-3 text-sm text-base-content/60">{displayUrl(kofiUrl)}</p>
  </div>
</section>

<!-- <script lang="ts">
  /**
   * Pricing tier definition used to render plan cards and features.
   */
  interface PricingFeature {
    label: string;
    included: boolean;
    hint?: string;
  }

  interface PricingTier {
    id: string;
    name: string;
    tagline: string;
    monthlyPrice: number; // USD monthly contribution
    ctaLabel: string;
    ctaHref: string;
    popular?: boolean;
    features: PricingFeature[];
  }

  let annualBilling = $state(true);

  const tiers: PricingTier[] = [
    {
      id: "free",
      name: "Free",
      tagline: "CubeIndex is free for everyone",
      monthlyPrice: 0,
      ctaLabel: "Use CubeIndex Free",
      ctaHref: "/auth/signup",
      features: [
        { label: "All core features", included: true },
        { label: "No paywalls", included: true },
        { label: "Community support", included: true },
        { label: "Optional supporter perks", included: false, hint: "Cosmetic only" },
      ],
    },
    {
      id: "supporter",
      name: "Supporter",
      tagline: "Help fund hosting and development",
      monthlyPrice: 3,
      ctaLabel: "Become a Supporter",
      ctaHref: "/auth/signup?support=supporter",
      popular: true,
      features: [
        { label: "Everything in Free", included: true },
        { label: "Keep CubeIndex free for all", included: true },
        { label: "Thank‑you note in app", included: true, hint: "Opt‑in when available" },
        { label: "Priority feedback consideration", included: true },
      ],
    },
    {
      id: "sponsor",
      name: "Sponsor",
      tagline: "Sustain ongoing improvements and infrastructure",
      monthlyPrice: 10,
      ctaLabel: "Become a Sponsor",
      ctaHref: "/about#contact",
      features: [
        { label: "Everything in Supporter", included: true },
        { label: "Fund new features & scale", included: true },
        { label: "Optional public thank‑you", included: true, hint: "With your consent" },
        { label: "Sponsor badge (opt‑in)", included: true },
      ],
    },
  ];

  function formatPriceUSD(n: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  }

  function priceForDisplay(monthly: number, _annual: boolean): string {
    if (monthly === 0) return "$0";
    // Support is voluntary — no discounts/upsells
    return formatPriceUSD(monthly);
  }

  function sublabel(monthly: number, annual: boolean): string {
    if (monthly === 0) return "Forever";
    return annual ? "per month (billed yearly)" : "per month";
  }
</script> -->

<!-- <svelte:head>
  <title>Support CubeIndex</title>
  <meta name="description" content="CubeIndex is free for everyone. If you find value, you can support ongoing development and hosting with an optional monthly contribution." />
</svelte:head>

<section class="relative">
  <div class="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent"></div>
  <div class="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20">
    <div class="text-center max-w-3xl mx-auto">
      <h1 class="font-clash text-4xl md:text-6xl font-extrabold tracking-tight">
        CubeIndex stays free — you can support it
      </h1>
      <p class="mt-4 text-base-content/70 text-lg">
        CubeIndex has no paywalls. If you want to help cover hosting and ongoing development, choose a voluntary monthly contribution below.
      </p>

      <div class="mt-8 inline-flex items-center gap-3 rounded-2xl bg-base-200 p-2">
        <button
          class="btn btn-sm rounded-xl {annualBilling ? '' : 'btn-primary'}"
          aria-pressed={!annualBilling}
          onclick={() => (annualBilling = false)}
        >
          Monthly
        </button>
        <div class="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
          Yearly support appreciated
        </div>
        <button
          class="btn btn-sm rounded-xl {annualBilling ? 'btn-primary' : ''}"
          aria-pressed={annualBilling}
          onclick={() => (annualBilling = true)}
        >
          Yearly
        </button>
      </div>
    </div>

    <div class="mt-10 grid gap-6 md:gap-8 md:grid-cols-3">
      {#each tiers as tier}
        <article
          class="card bg-base-100 shadow-sm border border-base-300 {tier.popular ? 'ring-2 ring-primary' : ''}"
        >
          {#if tier.popular}
            <div class="badge badge-primary absolute right-4 top-4">Most popular</div>
          {/if}
          <div class="card-body">
            <h2 class="card-title text-2xl">{tier.name}</h2>
            <p class="text-base-content/70">{tier.tagline}</p>

            <div class="mt-4">
              <div class="text-4xl font-extrabold tracking-tight">
                {priceForDisplay(tier.monthlyPrice, annualBilling)}
              </div>
              <div class="text-sm text-base-content/60">{sublabel(tier.monthlyPrice, annualBilling)}</div>
              {#if annualBilling && tier.monthlyPrice > 0}
                <div class="mt-1 text-xs text-base-content/50">
                  Billed {formatPriceUSD(tier.monthlyPrice * 12)} per year
                </div>
              {/if}
            </div>

            <ul class="mt-6 flex flex-col gap-2">
              {#each tier.features as f}
                <li class="inline-flex items-start gap-3 text-sm">
                  {#if f.included}
                    <i class="fa-solid fa-check text-success mt-0.5"></i>
                  {:else}
                    <i class="fa-solid fa-minus text-base-content/30 mt-0.5"></i>
                  {/if}
                  <span class="text-base-content/80">{f.label}{#if f.hint}<span class="text-base-content/50"> — {f.hint}</span>{/if}</span>
                </li>
              {/each}
            </ul>

            <div class="card-actions mt-6">
              <a href={tier.ctaHref} class="btn btn-primary btn-block rounded-xl">
                {tier.ctaLabel}
              </a>
            </div>
          </div>
        </article>
      {/each}
    </div>

    <div class="mt-16 grid gap-6 md:grid-cols-2 items-start">
      <div class="rounded-2xl border border-base-300 p-6 bg-base-100">
        <h3 class="font-semibold text-xl">Frequently asked</h3>
        <div class="mt-4 join join-vertical w-full">
          <details class="collapse collapse-arrow join-item border border-base-300">
            <summary class="collapse-title text-base font-medium">Is CubeIndex free?</summary>
            <div class="collapse-content text-sm text-base-content/70">
              Yes. CubeIndex is free for everyone and core features are not paywalled.
            </div>
          </details>
          <details class="collapse collapse-arrow join-item border border-base-300">
            <summary class="collapse-title text-base font-medium">What do supporters receive?</summary>
            <div class="collapse-content text-sm text-base-content/70">
              Our gratitude and optional cosmetic perks (like badges or shout‑outs) when available. No feature paywalls.
            </div>
          </details>
          <details class="collapse collapse-arrow join-item border border-base-300">
            <summary class="collapse-title text-base font-medium">Can I cancel anytime?</summary>
            <div class="collapse-content text-sm text-base-content/70">
              Yes. You can cancel support at any time; access to CubeIndex remains unchanged.
            </div>
          </details>
          <details class="collapse collapse-arrow join-item border border-base-300">
            <summary class="collapse-title text-base font-medium">Do you accept one‑time support?</summary>
            <div class="collapse-content text-sm text-base-content/70">
              Yes — contact us and we’ll help with a one‑time contribution.
            </div>
          </details>
        </div>
      </div>
      <div class="rounded-2xl border border-base-300 p-6 bg-base-100">
        <h3 class="font-semibold text-xl">Where your support goes</h3>
        <ul class="mt-4 grid grid-cols-1 gap-2 text-sm">
          <li class="inline-flex items-center gap-2"><i class="fa-solid fa-server text-primary"></i> Hosting & database</li>
          <li class="inline-flex items-center gap-2"><i class="fa-solid fa-wrench text-primary"></i> Maintenance & improvements</li>
          <li class="inline-flex items-center gap-2"><i class="fa-solid fa-seedling text-primary"></i> New features & research</li>
          <li class="inline-flex items-center gap-2"><i class="fa-solid fa-shield-heart text-primary"></i> Keeping CubeIndex ad‑free</li>
        </ul>
        <div class="mt-6">
          <a href="/about#contact" class="btn btn-outline rounded-xl">Questions? Contact us</a>
        </div>
      </div>
    </div>

    <div class="mt-16 text-center">
      <div class="rounded-3xl bg-gradient-to-r from-primary to-secondary p-[1px] inline-block">
        <div class="rounded-3xl bg-base-100 px-6 py-5">
          <div class="text-base-content/80">
            Have questions? <a href="/about#contact" class="link link-primary">Talk to us</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  :global(.card) {
    border-radius: 1rem;
  }
</style>
 -->
