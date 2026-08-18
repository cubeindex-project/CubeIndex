<script lang="ts">
  import SubmissionCubeCard from "$lib/components/cube/submissionCubeCard.svelte";

  const { data } = $props();
  const { cubeSubmissions, vendorSubmissions } = $derived(data);

  type SubmissionType = "cubes" | "vendors";
  type FilterKey = "all" | "pending" | "approved" | "rejected";

  let submissionType: SubmissionType = $state("cubes");
  let activeFilter: FilterKey = $state("all");
  const filters: { label: string; value: FilterKey }[] = [
    { label: "Approved", value: "approved" },
    { label: "Pending", value: "pending" },
    { label: "Rejected", value: "rejected" },
  ];

  const filteredCubes = $derived(
    activeFilter === "all"
      ? cubeSubmissions
      : cubeSubmissions.filter(
          (cube) => cube.status.toLowerCase() === activeFilter,
        ),
  );
  const filteredVendors = $derived(
    activeFilter === "all"
      ? vendorSubmissions
      : vendorSubmissions.filter(
          (vendor) => vendor.status.toLowerCase() === activeFilter,
        ),
  );

  function statusBadgeColor(status: string): string {
    if (status === "Approved") return "badge-success";
    if (status === "Rejected") return "badge-error";
    return "badge-warning";
  }
</script>

{#snippet noResults(resultsType: SubmissionType)}
  <div
    class="rounded-2xl border border-dashed border-base-300 p-10 text-center"
  >
    <p>No {resultsType} match this filter.</p>
  </div>
{/snippet}

<div class="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8">
  <header
    class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
  >
    <div class="space-y-1">
      <h1 class="font-clash text-3xl tracking-tight">My submissions</h1>
      <p class="text-sm text-base-content/70">
        Track catalog contributions and moderator decisions.
      </p>
    </div>
  </header>

  <div class="flex justify-between">
    <div role="tablist" class="tabs tabs-box w-fit">
      <button
        role="tab"
        class="tab"
        class:tab-active={submissionType === "cubes"}
        onclick={() => (submissionType = "cubes")}>Cubes</button
      >
      <button
        role="tab"
        class="tab"
        class:tab-active={submissionType === "vendors"}
        onclick={() => (submissionType = "vendors")}>Vendors</button
      >
    </div>

    <form class="filter" aria-label="Filter by status">
      <input
        class="btn"
        type="reset"
        value="x"
        onclick={() => (activeFilter = "all")}
      />
      {#each filters as filter (filter.value)}
        <input
          type="radio"
          class="btn"
          name="frameworks"
          aria-label={filter.label}
          onclick={() => (activeFilter = filter.value)}
        />
      {/each}
    </form>
  </div>

  {#if submissionType === "cubes"}
    {#if filteredCubes.length}
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {#each filteredCubes as cube (cube.slug)}
          <SubmissionCubeCard {cube} />
        {/each}
      </div>
    {:else}
      {@render noResults(submissionType)}
    {/if}
  {:else if filteredVendors.length}
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {#each filteredVendors as vendor (vendor.id)}
        <article class="card border border-base-300 bg-base-200">
          <div class="card-body">
            <div class="flex items-center gap-4">
              {#if vendor.logo_url}
                <img
                  src={vendor.logo_url}
                  alt=""
                  class="size-16 shrink-0 rounded-xl p-2 object-contain bg-white"
                />
              {:else}
                <div
                  class="grid size-16 place-items-center rounded-xl bg-base-300"
                >
                  <i class="fa-solid fa-store" aria-hidden="true"></i>
                </div>
              {/if}
              <div>
                <h2 class="card-title">{vendor.name}</h2>
                <span class={`badge ${statusBadgeColor(vendor.status)}`}>
                  {vendor.status}
                </span>
              </div>
            </div>
            <p>{vendor.country_iso} · {vendor.currency}</p>
            {#if vendor.staff_note}
              <p class="text-sm text-error">Staff note: {vendor.staff_note}</p>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  {:else}
    {@render noResults(submissionType)}
  {/if}
</div>
