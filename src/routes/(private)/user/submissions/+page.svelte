<script lang="ts">
  import SubmissionCubeCard from "$lib/components/cube/SubmissionCubeCard.svelte";
  // import VendorSubmissionCard from "$lib/components/submission/VendorSubmissionCard.svelte";

  const { data } = $props();
  const {
    cubeSubmissions,
    // vendorSubmissions
  } = $derived(data);

  type SubmissionType = "cubes" | "vendors";
  type FilterKey = "all" | "pending" | "approved" | "rejected";

  let submissionType: SubmissionType = $state("cubes");
  let activeFilter: FilterKey = $state("all");
  const filters: { label: string; value: FilterKey }[] = [
    { label: "Approved", value: "approved" },
    { label: "Pending", value: "pending" },
    { label: "Rejected", value: "rejected" },
  ];

  const filteredCubeSubmissions = $derived(
    activeFilter === "all"
      ? cubeSubmissions
      : cubeSubmissions.filter(
          (cubeSubmission) =>
            cubeSubmission.status.toLowerCase() === activeFilter,
        ),
  );
  // const filteredVendors = $derived(
  //   activeFilter === "all"
  //     ? vendorSubmissions
  //     : vendorSubmissions.filter(
  //         (vendor) => vendor.status.toLowerCase() === activeFilter,
  //       ),
  // );
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
    {#if filteredCubeSubmissions.length}
      <div
        class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 items-start"
      >
        {#each filteredCubeSubmissions as cubeSubmission, index (index)}
          <SubmissionCubeCard {cubeSubmission} />
        {/each}
      </div>
    {:else}
      {@render noResults(submissionType)}
    {/if}
  {:else}
    <!-- {#if filteredVendors.length}
      <div
        class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 items-start"
      >
        {#each filteredVendors as vendor (vendor.id)}
          <VendorSubmissionCard {vendor} />
        {/each}
      </div>
    {:else}
      {@render noResults(submissionType)}
    {/if} -->
  {/if}
</div>
