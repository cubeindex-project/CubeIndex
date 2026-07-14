<script lang="ts">
  import { resolve } from "$app/paths";

  const { data } = $props();
  const { vendors } = $derived(data);

  type Status = "All" | "Pending" | "Approved" | "Rejected";
  let status: Status = $state("Pending");
  let search = $state("");

  const filteredVendors = $derived(
    vendors.filter(
      (vendor) =>
        (status === "All" || vendor.status === status) &&
        vendor.name.toLowerCase().includes(search.toLowerCase()),
    ),
  );
</script>

<section class="mx-auto min-h-screen max-w-7xl space-y-8 px-6 py-12">
  <header class="space-y-2">
    <h1 class="font-clash text-4xl font-semibold">Manage vendors</h1>
    <p class="text-base-content/70">Review and manage vendor submissions.</p>
  </header>

  <div class="flex flex-col gap-4 sm:flex-row">
    <input
      type="search"
      class="input w-full"
      placeholder="Search vendors"
      bind:value={search}
    />
    <select class="select" bind:value={status} aria-label="Filter by status">
      <option>All</option>
      <option>Pending</option>
      <option>Approved</option>
      <option>Rejected</option>
    </select>
  </div>

  {#if filteredVendors.length}
    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {#each filteredVendors as vendor (vendor.id)}
        <article class="card border border-base-300 bg-base-200">
          <div class="card-body">
            <div class="flex items-center gap-4">
              {#if vendor.logo_url}
                <img
                  src={vendor.logo_url}
                  alt=""
                  class="size-16 rounded-xl bg-white object-contain p-2"
                />
              {/if}
              <div>
                <h2 class="card-title">{vendor.name}</h2>
                <span class="badge">{vendor.status}</span>
              </div>
            </div>
            <p class="text-sm text-base-content/70">
              Submitted by {vendor.submitter?.display_name ?? "Unknown user"}
            </p>
            <div class="card-actions mt-3 justify-end">
              <a
                class="btn btn-primary btn-sm"
                href={resolve("/(admin)/staff/vendors/review/[slug]", {
                  slug: vendor.slug,
                })}
              >
                Review
              </a>
            </div>
          </div>
        </article>
      {/each}
    </div>
  {:else}
    <p
      class="rounded-2xl border border-dashed border-base-300 p-10 text-center"
    >
      No vendor submissions match these filters.
    </p>
  {/if}
</section>
