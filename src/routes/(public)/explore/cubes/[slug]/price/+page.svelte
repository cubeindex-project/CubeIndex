<script lang="ts">
  import type { Cube, CubeVendorLinks } from "$lib/components/dbTableTypes";
  import Chart from "chart.js/auto";
  import { onMount } from "svelte";

  let { data } = $props();
  let {
    cube = {} as Cube,
    vendor_links = [] as CubeVendorLinks[],
    dates,
    historyByVendor,
  } = $derived(data);

  const pageTitle = $derived(
    `${cube.series} ${cube.model}${
      cube.version_name ? ` ${cube.version_name}` : ""
    } - Price Tracking`
  );

  function datasetFor(vendor: string) {
    const series = data.historyByVendor[vendor] ?? [];
    const map = new Map(series.map((p) => [p.date, p.price]));
    const aligned = dates.map((d) => (map.has(d) ? map.get(d)! : null));
    return {
      label: vendor,
      data: aligned,
      spanGaps: true,
      borderWidth: 2,
      pointRadius: 3, // Slightly larger points for easier interaction
      tension: 0.25,
    };
  }

  let canvasEl: HTMLCanvasElement;
  let chartInstance: Chart;

  onMount(() => {
    chartInstance = new Chart(canvasEl, {
      type: "line",
      data: {
        labels: dates,
        datasets: Object.keys(historyByVendor).map((vendor) => {
          return datasetFor(vendor);
        }),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              usePointStyle: true,
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: "Price ($)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Date",
            },
          },
        },
      },
    });
  });

  function getVendorStatus(shop: CubeVendorLinks) {
    if (shop.available) {
      return {
        text: "In Stock",
        icon: "fa-solid fa-check-circle text-green-500",
        class: "btn-success",
      };
    } else {
      return {
        text: "Out of Stock",
        icon: "fa-solid fa-times-circle text-red-500",
        class: "btn-error",
      };
    }
  }

  function getCurrencySymbol(currencyCode: string) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value;
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div class="space-y-6">
  {#if vendor_links.length > 0}
    <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
      <i class="fa-solid fa-store"></i>
      Available at:
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each vendor_links as shop}
        {@const status = getVendorStatus(shop)}
        <a
          href={shop.url}
          target="_blank"
          rel="noopener noreferrer"
          class="group block p-4 rounded-xl border border-base-300 bg-base-200 hover:bg-base-300 transition-colors duration-200"
        >
          <div class="flex items-center justify-between">
            <span class="text-lg font-semibold">
              {shop.vendor_name}
            </span>
            <span class="text-sm font-medium {status.class}">
              <i class="{status.icon} mr-1"></i>
              {status.text}
            </span>
          </div>
          <div class="mt-2 text-xl font-bold">
            <span class="text-primary">
              {getCurrencySymbol(shop.vendor.currency)}{shop.price.toFixed(2)}
            </span>
          </div>
        </a>
      {/each}
    </div>
  {:else}
    <p class="text-center italic">No vendor information available.</p>
  {/if}

  <div class="flex w-full justify-between items-center">
    <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
      <i class="fa-solid fa-chart-line"></i>
      Price History
    </h2>
    <span
      class="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
    >
      Beta
    </span>
  </div>
  <div class="w-full h-80">
    <canvas bind:this={canvasEl}></canvas>
  </div>
</div>
