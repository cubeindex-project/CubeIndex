<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { PageData } from "./$types";
  import type { Chart as ChartJS } from "chart.js";

  const { data }: { data: PageData } = $props();
  const { profile, stats } = $derived(data);

  const hasData = $derived(stats.cube_count > 0);

  let brandCanvas: HTMLCanvasElement | null = $state(null);
  let storesCanvas: HTMLCanvasElement | null = $state(null);
  let typesCanvas: HTMLCanvasElement | null = $state(null);
  let conditionsCanvas: HTMLCanvasElement | null = $state(null);
  let cubesOverTimeCanvas: HTMLCanvasElement | null = $state(null);

  let brandChart: ChartJS | null = $state(null);
  let storesChart: ChartJS | null = $state(null);
  let typesChart: ChartJS | null = $state(null);
  let conditionsChart: ChartJS | null = $state(null);
  let cubesOverTimeChart: ChartJS | null = $state(null);

  function generateHslColors(count: number, alpha = 0.85): string[] {
    if (count <= 0) return [];
    return Array.from({ length: count }, (_, i) => {
      const hue = Math.round((i * 360) / count);
      return `hsla(${hue}, 70%, 55%, ${alpha})`;
    });
  }

  onMount(async () => {
    if (!hasData) return;

    const { Chart } = await import("chart.js/auto");

    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      borderWidth: 1,
      plugins: {
        legend: {
          position: "right",
          labels: { usePointStyle: true },
        },
      },
    } as const;

    const makeDoughnut = (
      canvas: HTMLCanvasElement,
      breakdown: Record<string, number>,
      existing: ChartJS | null,
    ) => {
      const colors = generateHslColors(Object.keys(breakdown).length);
      existing?.destroy();
      return new Chart(canvas, {
        type: "doughnut",
        data: {
          labels: Object.keys(breakdown),
          datasets: [{ label: "Cubes", data: Object.values(breakdown) }],
        },
        options: {
          ...baseOptions,
          backgroundColor: colors,
          borderColor: colors.map((c) =>
            c.replace("hsla(", "hsl(").replace(/, [0-9.]+\)$/, ")"),
          ),
          cutout: "55%",
        },
      });
    };

    const makeLine = (
      canvas: HTMLCanvasElement,
      series: Record<string, number>,
      existing: ChartJS | null,
    ) => {
      existing?.destroy();
      return new Chart(canvas, {
        type: "line",
        data: {
          labels: Object.keys(series),
          datasets: [{ label: "Cubes bought", data: Object.values(series) }],
        },
        options: {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: { display: false },
          },
        },
      });
    };

    if (brandCanvas && stats.cubes_per_brand) {
      brandChart = makeDoughnut(brandCanvas, stats.cubes_per_brand, brandChart);
    }
    if (storesCanvas && stats.cubes_per_store) {
      storesChart = makeDoughnut(
        storesCanvas,
        stats.cubes_per_store,
        storesChart,
      );
    }
    if (typesCanvas && stats.cubes_per_type) {
      typesChart = makeDoughnut(typesCanvas, stats.cubes_per_type, typesChart);
    }
    if (conditionsCanvas && stats.cubes_per_condition) {
      conditionsChart = makeDoughnut(
        conditionsCanvas,
        stats.cubes_per_condition,
        conditionsChart,
      );
    }
    if (cubesOverTimeCanvas && stats.cubes_over_time) {
      cubesOverTimeChart = makeLine(
        cubesOverTimeCanvas,
        stats.cubes_over_time,
        cubesOverTimeChart,
      );
    }
  });

  onDestroy(() => {
    brandChart?.destroy();
    storesChart?.destroy();
    typesChart?.destroy();
    conditionsChart?.destroy();
    cubesOverTimeChart?.destroy();
  });
</script>

<svelte:head>
  <title>{profile.display_name}'s Statistics - CubeIndex</title>
</svelte:head>

<section class="relative max-w-6xl mx-auto mt-12 px-4 space-y-8">
  <header class="space-y-2">
    <div
      class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight">
          {profile.display_name}'s Collection Stats
        </h1>
      </div>
    </div>
  </header>

  {#if !hasData}
    <section
      class="rounded-2xl border border-dashed border-base-300 bg-base-200/60 p-10 text-center"
    >
      <div
        class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
      >
        <i class="fa-solid fa-chart-simple fa-2x"></i>
      </div>
      <h2 class="text-xl font-semibold">No cubes to show yet</h2>
      <p class="text-sm text-base-content/70">
        Add cubes to your collection to unlock rich stats and insights.
      </p>
    </section>
  {:else}
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div class="stat bg-base-200 rounded-2xl border border-base-300/40">
        <div class="stat-title">Total cubes</div>
        <div class="stat-value text-3xl">{stats.cube_count}</div>
      </div>

      <div class="stat bg-base-200 rounded-2xl border border-base-300/40">
        <div class="stat-title">Collection value</div>
        <div class="stat-value text-3xl">
          {#if stats.collection_value}
            ${stats.collection_value}
          {:else}
            Not enough data
          {/if}
        </div>
      </div>

      <div class="stat bg-base-200 rounded-2xl border border-base-300/40">
        <div class="stat-title">Average rating</div>
        {#if stats.rating_count}
          <div class="stat-value text-3xl">{stats.rating_avg?.toFixed(2)}</div>
          <div class="stat-desc">From {stats.rating_count} ratings</div>
        {:else}
          <div class="stat-value text-3xl">Not enough data</div>
        {/if}
      </div>
    </div>

    <section class="grid gap-6 lg:grid-cols-2">
      <article
        class="card bg-base-200 shadow-sm border border-base-300/40"
        aria-label="Cubes per brand"
      >
        <div class="card-body gap-4">
          <div class="flex items-start justify-between gap-3">
            <h2 class="card-title text-lg">Cubes per brand</h2>
          </div>
          {#if stats.cubes_per_brand}
            <div class="relative h-64">
              <canvas bind:this={brandCanvas}></canvas>
            </div>
          {:else}
            <div class="text-sm text-base-content/70">Not enough data</div>
          {/if}
        </div>
      </article>

      <article
        class="card bg-base-200 shadow-sm border border-base-300/40"
        aria-label="Stores most used"
      >
        <div class="card-body gap-4">
          <div class="flex items-start justify-between gap-3">
            <h2 class="card-title text-lg">Cubes per store</h2>
          </div>

          {#if stats.cubes_per_store}
            <div class="relative h-64">
              <canvas bind:this={storesCanvas}></canvas>
            </div>
          {:else}
            <div class="text-sm text-base-content/70">Not enough data</div>
          {/if}
        </div>
      </article>

      <article
        class="card bg-base-200 shadow-sm border border-base-300/40"
        aria-label="Cubes by type"
      >
        <div class="card-body gap-4">
          <div class="flex items-start justify-between gap-3">
            <h2 class="card-title text-lg">Cubes per type</h2>
          </div>

          {#if stats.cubes_per_type}
            <div class="relative h-64">
              <canvas bind:this={typesCanvas}></canvas>
            </div>
          {:else}
            <div class="text-sm text-base-content/70">Not enough data</div>
          {/if}
        </div>
      </article>

      <article
        class="card bg-base-200 shadow-sm border border-base-300/40"
        aria-label="Condition breakdown"
      >
        <div class="card-body gap-4">
          <div class="flex items-start justify-between gap-3">
            <h2 class="card-title text-lg">Cubes per condition</h2>
          </div>

          {#if stats.cubes_per_condition}
            <div class="relative h-64">
              <canvas bind:this={conditionsCanvas}></canvas>
            </div>
          {:else}
            <div class="text-sm text-base-content/70">Not enough data</div>
          {/if}
        </div>
      </article>
    </section>

    <section class="grid gap-6">
      <article
        class="card bg-base-200 shadow-sm border border-base-300/40"
        aria-label="Cubes added over time"
      >
        <div class="card-body gap-4">
          <div class="flex items-start justify-between gap-3">
            <h2 class="card-title text-lg">Cubes over time</h2>
          </div>

          {#if stats.cubes_over_time}
            <div class="relative h-72">
              <canvas bind:this={cubesOverTimeCanvas}></canvas>
            </div>
          {:else}
            <div class="text-sm text-base-content/70">Not enough data</div>
          {/if}
        </div>
      </article>
    </section>
  {/if}
</section>
