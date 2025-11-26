<script lang="ts">
  import type { CubeVendorLinks, DetailedCube } from "$lib/components/dbTableTypes";
  import Chart from "chart.js/auto";
  import { onMount, onDestroy } from "svelte";
  import { getCurrencySymbol } from "$lib/components/helper_functions/getCurrencySymbol.js";
  import Tag from "$lib/components/misc/tag.svelte";

  // Props / derived (Svelte 5)
  let { data } = $props();
  let {
    cube = {} as DetailedCube,
    vendor_links = [] as CubeVendorLinks[],
    dates = [] as string[],
    historyByVendor = {} as Record<string, { date: string; price: number }[]>,
  } = $derived(data);

  // Page title
  const pageTitle = $derived(
    `${cube.name} - Price Tracking`
  );

  // Formatting helpers
  const nf = (currency?: string) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    });

  function datasetFor(vendor: string) {
    const series = historyByVendor[vendor] ?? [];
    const map = new Map(series.map((p) => [p.date, p.price]));
    const aligned = dates.map((d) => (map.has(d) ? map.get(d)! : null));
    return {
      label: vendor,
      data: aligned,
      spanGaps: true,
      borderWidth: 2,
      pointRadius: 3,
      tension: 0.25,
    };
  }

  let canvasEl: HTMLCanvasElement;
  let chartInstance: Chart | undefined;

  // Build chart on mount; clean up on destroy
  onMount(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    chartInstance = new Chart(canvasEl, {
      type: "line",
      data: {
        labels: dates,
        datasets: Object.keys(historyByVendor).map(datasetFor),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: prefersReducedMotion ? false : { duration: 300 },
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: { usePointStyle: true },
          },
          tooltip: {
            callbacks: {
              label(ctx) {
                const v = ctx.parsed.y;
                if (v == null) return `${ctx.dataset.label}: —`;
                // If vendor_links include currency per vendor, prefer that; else show plain $
                const vendorCurrency = vendor_links.find(
                  (vl) => vl.vendor_name === ctx.dataset.label
                )?.vendor?.currency;
                return `${ctx.dataset.label}: ${
                  vendorCurrency
                    ? nf(vendorCurrency).format(v)
                    : `$${v.toFixed(2)}`
                }`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            title: { display: true, text: "Price" },
            ticks: {
              display: false,
            },
          },
          x: {
            title: { display: true, text: "Date" },
          },
        },
      },
    });
  });

  onDestroy(() => {
    chartInstance?.destroy();
    chartInstance = undefined;
  });

  // Vendor pill status
  function getVendorStatus(shop: CubeVendorLinks) {
    if (shop.available) {
      return {
        text: "In stock",
        icon: "fa-solid fa-circle-check",
        badgeClass:
          "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
      };
    }
    return {
      text: "Out of stock",
      icon: "fa-solid fa-circle-xmark",
      badgeClass:
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
    };
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta
    name="description"
    content="Historical price tracking across vendors for this cube."
  />
</svelte:head>

<div class="space-y-8">
  <!-- Vendor grid -->
  {#if vendor_links.length > 0}
    <section aria-labelledby="vendors-title">
      <h2
        id="vendors-title"
        class="text-lg font-semibold mb-3 flex items-center gap-2"
      >
        <i class="fa-solid fa-store" aria-hidden="true"></i>
        Available at
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each vendor_links as shop}
          {@const status = getVendorStatus(shop)}
          <a
            href={shop.url}
            target="_blank"
            rel="noopener noreferrer"
            class="group block rounded-xl border border-base-300 bg-base-200 hover:bg-base-300/70 focus:outline-none focus-visible:ring focus-visible:ring-primary/40 transition-colors duration-200 p-4"
            aria-label={`Open ${shop.vendor_name} in a new tab`}
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="text-base font-semibold truncate">
                  {shop.vendor_name}
                </div>
                <div class="mt-1 text-2xl font-bold">
                  {#if shop.price != null}
                    <span class="text-primary">
                      {#if shop.vendor?.currency}
                        {nf(shop.vendor.currency).format(shop.price)}
                      {:else}
                        {getCurrencySymbol(
                          shop.vendor?.currency
                        )}{shop.price.toFixed(2)}
                      {/if}
                    </span>
                  {:else}
                    <span class="opacity-60">—</span>
                  {/if}
                </div>
              </div>
              <span class={status.badgeClass}>
                <i class={status.icon} aria-hidden="true"></i>
                {status.text}
              </span>
            </div>

            <div
              class="mt-3 inline-flex items-center gap-1 text-xs text-base-content/70 group-hover:text-base-content/90"
            >
              Visit store <i
                class="fa-solid fa-arrow-up-right-from-square"
                aria-hidden="true"
              ></i>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {:else}
    <section
      aria-live="polite"
      class="rounded-xl border border-dashed border-base-300 p-6 text-center"
    >
      <p class="font-medium">No vendor information available</p>
      <p class="text-sm text-base-content/70">
        We’ll display shops and prices as soon as we track them.
      </p>
    </section>
  {/if}

  <!-- Chart -->
  <section aria-labelledby="price-history-title" class="space-y-3">
    <h2
      id="price-history-title"
      class="text-lg font-semibold flex items-center gap-2"
    >
      <i class="fa-solid fa-chart-line" aria-hidden="true"></i>
      Price history
      <Tag label="Beta" gradient="from-indigo-500 via-purple-500 to-pink-500" />
    </h2>

    {#if dates.length > 0 && Object.keys(historyByVendor).length > 0}
      <div
        class="w-full h-80 rounded-xl border border-base-300 bg-base-200 p-3"
      >
        <canvas bind:this={canvasEl} aria-label="Line chart of price history"
        ></canvas>
      </div>
    {:else}
      <div
        class="rounded-xl border border-dashed border-base-300 p-6 text-center"
      >
        <p class="font-medium">Not enough data yet</p>
        <p class="text-sm text-base-content/70">
          Come back later as we gather more price points.
        </p>
      </div>
    {/if}
  </section>
</div>
