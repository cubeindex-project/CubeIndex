<script lang="ts">
  import type {
    Cube,
    CubePriceAlertSubscriptions,
    CubeVendorLinks,
    PriceAlertChannel,
  } from "$lib/components/dbTableTypes";
  import type { User } from "@supabase/supabase-js";
  import Chart from "chart.js/auto";
  import { onMount, onDestroy } from "svelte";
  import { getCurrencySymbol } from "$lib/components/helper_functions/getCurrencySymbol.js";
  import Tag from "$lib/components/misc/tag.svelte";
  import { toast } from "svelte-sonner";

  // Props / derived (Svelte 5)
  let { data } = $props();
  let {
    cube = {} as Cube,
    vendor_links = [] as CubeVendorLinks[],
    dates = [] as string[],
    historyByVendor = {} as Record<string, { date: string; price: number }[]>,
    subscriptions = [] as CubePriceAlertSubscriptions[],
    wishlistCubes = [] as { slug: string; label: string }[],
    cubeNameMap = {} as Record<string, string>,
    isWishlisted = false,
    user = null as User | null,
  } = $derived(data);

  // Page title
  const pageTitle = $derived(
    `${cube.series} ${cube.model}${cube.version_name ? ` ${cube.version_name}` : ""} - Price Tracking`
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

  let canvasEl = $state<HTMLCanvasElement | undefined>(undefined);
  let chartInstance: Chart | undefined;

  // Build chart on mount; clean up on destroy
  onMount(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const element = canvasEl;
    if (!element) return;

    chartInstance = new Chart(element, {
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

  // Alert subscription state
  let userSubscriptions = $state<CubePriceAlertSubscriptions[]>([]);

  $effect(() => {
    userSubscriptions = subscriptions.map((sub) => ({
      ...sub,
      desired_price: Number(sub.desired_price),
    }));
  });
  let formCubeSlug = $state<string>("");
  let formPrice = $state<number | "">("");
  let formChannel = $state<PriceAlertChannel>("in_app");
  let editingId = $state<string | null>(null);
  let saving = $state(false);
  let deletingId = $state<string | null>(null);

  const minVendorPrice = $derived.by<number | null>(() => {
    const prices = vendor_links
      .map((shop) =>
        typeof shop.price === "number" && Number.isFinite(shop.price)
          ? shop.price
          : null
      )
      .filter((value): value is number => value != null);
    if (prices.length === 0) return null;
    return Math.min(...prices);
  });

  const alertCubeOptions = $derived.by<{ slug: string; label: string }[]>(() => {
    const seen = new Map<string, string>();
    if (cube.slug) {
      seen.set(
        cube.slug,
        cubeNameMap[cube.slug] ??
          `${cube.series} ${cube.model}${
            cube.version_name ? ` ${cube.version_name}` : ""
          }`
      );
    }
    for (const entry of wishlistCubes) {
      seen.set(entry.slug, entry.label);
    }
    for (const sub of userSubscriptions) {
      if (!seen.has(sub.cube_slug)) {
        seen.set(sub.cube_slug, cubeNameMap[sub.cube_slug] ?? sub.cube_slug);
      }
    }
    return Array.from(seen.entries()).map(([slug, label]) => ({ slug, label }));
  });

  const subscriptionsForCurrentCube = $derived.by<CubePriceAlertSubscriptions[]>(() =>
    userSubscriptions.filter((sub) => sub.cube_slug === cube.slug)
  );

  const selectedCubeSubscriptions = $derived.by<CubePriceAlertSubscriptions[]>(() =>
    userSubscriptions.filter((sub) => sub.cube_slug === formCubeSlug)
  );

  const timestampFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  function formatAlertTimestamp(value: string | null | undefined) {
    if (!value) return "Never";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Never";
    return timestampFormatter.format(date);
  }

  function resolveCubeLabel(slug: string) {
    return (
      cubeNameMap[slug] ??
      alertCubeOptions.find((option) => option.slug === slug)?.label ??
      slug
    );
  }

  function roundToCents(value: number): number {
    return Math.round(value * 100) / 100;
  }

  function updatePrice(value: string) {
    if (value === "") {
      formPrice = "";
      return;
    }
    const numeric = Number(value);
    formPrice = Number.isFinite(numeric)
      ? roundToCents(numeric)
      : "";
  }

  function handleCubeSelect(
    slug: string,
    { keepChannel = false }: { keepChannel?: boolean } = {}
  ) {
    formCubeSlug = slug;
    if (!keepChannel) {
      formChannel = "in_app";
    }
    if (!editingId) {
      const existing = userSubscriptions.find(
        (sub) => sub.cube_slug === slug && sub.channel === formChannel
      );
      if (existing) {
        formPrice = Number(existing.desired_price);
        return;
      }
    }
    if (slug === cube.slug && isWishlisted && minVendorPrice != null) {
      formPrice = roundToCents(minVendorPrice);
      return;
    }
    if (!editingId) {
      formPrice = "";
    }
  }

  function handleChannelChange(channel: PriceAlertChannel) {
    formChannel = channel;
    if (!editingId) {
      const existing = userSubscriptions.find(
        (sub) => sub.cube_slug === formCubeSlug && sub.channel === channel
      );
      if (existing) {
        formPrice = Number(existing.desired_price);
        return;
      }
      if (formCubeSlug === cube.slug && isWishlisted && minVendorPrice != null) {
        formPrice = roundToCents(minVendorPrice);
        return;
      }
      formPrice = "";
    }
  }

  function startEdit(subscription: CubePriceAlertSubscriptions) {
    editingId = subscription.id;
    formCubeSlug = subscription.cube_slug;
    formChannel = subscription.channel;
    formPrice = Number(subscription.desired_price);
  }

  function resetForm() {
    editingId = null;
    formChannel = "in_app";
    handleCubeSelect(cube.slug);
  }

  function mergeSubscription(updated: CubePriceAlertSubscriptions) {
    const normalized: CubePriceAlertSubscriptions = {
      ...updated,
      desired_price: Number(updated.desired_price),
    };
    const clone = userSubscriptions.slice();
    const index = clone.findIndex((sub) => sub.id === normalized.id);
    if (index >= 0) {
      clone[index] = normalized;
    } else {
      clone.push(normalized);
    }
    userSubscriptions = clone;
  }

  async function saveAlert(event: SubmitEvent) {
    event.preventDefault();
    if (saving) return;

    const priceValue =
      typeof formPrice === "number" ? formPrice : Number(formPrice);
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      toast.error("Enter a price greater than zero.");
      return;
    }

    saving = true;
    const editing = editingId != null;

    try {
      const response = await fetch("/api/price-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId ?? undefined,
          cubeSlug: formCubeSlug,
          desiredPrice: Number(priceValue.toFixed(2)),
          channel: formChannel,
        }),
      });

      const body = await response.json().catch(() => ({ success: false }));

      if (!response.ok || !body.success) {
        throw new Error(body?.error ?? "Failed to save alert");
      }

      mergeSubscription(body.data as CubePriceAlertSubscriptions);
      toast.success(editing ? "Alert updated." : "Alert created.");
      editingId = null;
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to save alert."
      );
    } finally {
      saving = false;
    }
  }

  async function deleteAlert(id: string) {
    if (deletingId) return;
    deletingId = id;
    try {
      const response = await fetch(`/api/price-alerts/${id}`, {
        method: "DELETE",
      });
      const body = await response.json().catch(() => ({ success: false }));
      if (!response.ok || !body.success) {
        throw new Error(body?.error ?? "Failed to remove alert");
      }
      userSubscriptions = userSubscriptions.filter((sub) => sub.id !== id);
      if (editingId === id) {
        resetForm();
      }
      toast.success("Alert removed.");
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to remove alert."
      );
    } finally {
      deletingId = null;
    }
  }

  onMount(() => {
    handleCubeSelect(cube.slug, { keepChannel: true });
  });
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

  <!-- Alerts -->
  <section
    aria-labelledby="price-alerts-title"
    class="rounded-2xl border border-base-300 bg-base-200/40 p-5 space-y-5"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2
        id="price-alerts-title"
        class="text-lg font-semibold flex items-center gap-2"
      >
        <i class="fa-solid fa-bell" aria-hidden="true"></i>
        Price alerts
      </h2>
      {#if user}
        <span class="badge badge-outline badge-sm sm:badge-md">
          {userSubscriptions.length} total
        </span>
      {/if}
    </div>

    {#if !user}
      <div class="alert alert-info">
        <i class="fa-solid fa-right-to-bracket"></i>
        <span>
          Sign in to subscribe to price changes and get notified instantly.
        </span>
      </div>
    {:else}
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <form class="space-y-4" onsubmit={saveAlert}>
          <div class="form-control">
            <label class="label" for="price-alert-cube">
              <span class="label-text">Cube</span>
            </label>
            <select
              class="select select-bordered"
              bind:value={formCubeSlug}
              id="price-alert-cube"
              onchange={(event) =>
                handleCubeSelect(event.currentTarget.value, { keepChannel: true })
              }
            >
              {#each alertCubeOptions as option (option.slug)}
                <option value={option.slug}>
                  {option.label}
                  {option.slug === cube.slug ? " (this page)" : ""}
                </option>
              {/each}
            </select>
            {#if wishlistCubes.length > 0}
              <p class="label-text-alt mt-1">
                Wishlist cubes appear here so you can pre-fill alerts quickly.
              </p>
            {/if}
          </div>

          <div class="form-control">
            <label class="label" for="price-alert-price">
              <span class="label-text">Desired price</span>
            </label>
            <input
              class="input input-bordered"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 19.99"
              value={formPrice === "" ? "" : formPrice}
              id="price-alert-price"
              oninput={(event) => updatePrice(event.currentTarget.value)}
              required
            />
            {#if formCubeSlug === cube.slug && isWishlisted && minVendorPrice != null}
              <p class="label-text-alt text-success mt-1">
                Wishlist cube detected — pre-filled with
                {nf().format(roundToCents(minVendorPrice))}
              </p>
            {/if}
          </div>

          <div class="form-control">
            <label class="label" for="price-alert-channel">
              <span class="label-text">Notification channel</span>
            </label>
            <select
              class="select select-bordered"
              bind:value={formChannel}
              id="price-alert-channel"
              onchange={(event) =>
                handleChannelChange(
                  event.currentTarget.value as PriceAlertChannel
                )
              }
            >
              <option value="in_app">In-app notification</option>
              <option value="email">Email + notification</option>
            </select>
          </div>

          {#if editingId}
            <div class="alert alert-info">
              <i class="fa-solid fa-pen-to-square"></i>
              <span>Updating an existing alert.</span>
            </div>
          {/if}

          <div class="flex flex-wrap items-center gap-2 pt-1">
            <button class="btn btn-primary" type="submit" disabled={saving}>
              {#if saving}
                <span class="loading loading-spinner loading-xs mr-2"></span>
              {/if}
              {editingId ? "Update alert" : "Create alert"}
            </button>
            <button
              class="btn btn-ghost"
              type="button"
              onclick={resetForm}
              disabled={saving}
            >
              Reset
            </button>
          </div>
        </form>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold">Alerts for this cube</h3>
            {#if subscriptionsForCurrentCube.length > 0}
              <span class="badge badge-outline badge-sm">
                {subscriptionsForCurrentCube.length}
              </span>
            {/if}
          </div>

          {#if subscriptionsForCurrentCube.length === 0}
            <p class="text-sm text-base-content/70">
              No alerts yet. Save one with the form to be notified about price
              drops.
            </p>
          {:else}
            <ul class="space-y-3">
              {#each subscriptionsForCurrentCube as sub (sub.id)}
                <li class="rounded-xl border border-base-300 bg-base-100/80 p-4">
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div class="text-sm text-base-content/70">
                        Target price
                      </div>
                      <div class="text-lg font-semibold">
                        {nf().format(sub.desired_price)}
                      </div>
                      <div class="text-xs text-base-content/60 mt-1">
                        Channel:
                        {sub.channel === "in_app"
                          ? "In-app"
                          : "Email & in-app"}
                      </div>
                      <div class="text-xs text-base-content/60">
                        Last triggered:
                        {formatAlertTimestamp(sub.last_notified_at)}
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <button
                        class="btn btn-xs btn-outline"
                        type="button"
                        onclick={() => startEdit(sub)}
                      >
                        Edit
                      </button>
                      <button
                        class="btn btn-xs btn-error"
                        type="button"
                        disabled={deletingId === sub.id}
                        onclick={() => deleteAlert(sub.id)}
                      >
                        {#if deletingId === sub.id}
                          <span class="loading loading-spinner loading-xs mr-1"></span>
                        {/if}
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              {/each}
            </ul>
          {/if}

          {#if selectedCubeSubscriptions.length > 0 && formCubeSlug !== cube.slug}
            <div class="alert alert-info">
              <i class="fa-solid fa-circle-info"></i>
              <span>
                You already track {resolveCubeLabel(formCubeSlug)} at
                {selectedCubeSubscriptions.length}
                {selectedCubeSubscriptions.length === 1 ? " price" : " prices"}.
              </span>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </section>

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
