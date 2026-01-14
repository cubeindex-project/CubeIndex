<script lang="ts">
  import type {
    CubeVendorLinks,
    DetailedCube,
  } from "$lib/components/dbTableTypes";
  import Chart from "chart.js/auto";
  import { onMount, onDestroy } from "svelte";
  import { getCurrencySymbol } from "$lib/components/helper_functions/getCurrencySymbol.js";
  import Tag from "$lib/components/misc/tag.svelte";

  let { data } = $props();
  let {
    vendor_links = [] as CubeVendorLinks[],
    per_vendor_history,
  } = $derived(data);

  // Formatting helpers
  const nf = (currency?: string) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    });

  // Bound canvas element reference must be reactive for Svelte 5
  let canvas: HTMLCanvasElement | null = $state(null);
  let chart: Chart | null = $state(null);

  // Build chart on mount; clean up on destroy
  onMount(() => {
    if (!canvas) return;

    chart?.destroy();

    const labels = Array.from(
      new Set(
        per_vendor_history.flatMap((row) =>
          row.price_history.map((p) => p.date),
        ),
      ),
    ).sort();

    const datasets = per_vendor_history.map((row) => {
      // Map date -> price for quick lookup
      const priceByDate = new Map(
        row.price_history.map((p) => [p.date, p.price] as const),
      );

      return {
        label: row.vendor_name,
        data: labels.map((date) => priceByDate.get(date) ?? null) as (
          | number
          | null
        )[], // null makes a gap
        spanGaps: true,
      };
    });

    chart = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: { usePointStyle: true },
          },
          tooltip: {
            callbacks: {
              label: ({ parsed: { y }, dataset: { label } }) => {
                if (y == null) return `${label}: -`;
                const currency = vendor_links.find(
                  (l) => l.vendor_name === label,
                )?.vendor?.currency;
                return `${label}: ${currency ? nf(currency).format(y) : `$${y.toFixed(2)}`}`;
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
    chart?.destroy();
  });

  // Vendor pill status
  function getVendorStatus(shop: CubeVendorLinks) {
    if (shop.available) {
      return {
        text: "In stock",
        icon: "fa-solid fa-circle-check",
        badgeClass:
          "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 whitespace-nowrap",
      };
    }
    return {
      text: "Out of stock",
      icon: "fa-solid fa-circle-xmark",
      badgeClass:
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 whitespace-nowrap",
    };
  }
</script>

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
        {#each vendor_links as shop (shop.id)}
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
                          shop.vendor?.currency,
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

    {#if per_vendor_history.length > 0}
      <div
        class="w-full h-80 rounded-xl border border-base-300 bg-base-200 p-3"
      >
        <canvas bind:this={canvas} aria-label="Line chart of price history"
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
