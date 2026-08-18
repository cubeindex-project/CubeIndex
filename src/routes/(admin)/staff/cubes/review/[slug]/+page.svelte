<script lang="ts">
  import SubmissionStatusManager from "$lib/components/staff/SubmissionStatusManager.svelte";
  import { formatDate } from "$lib/utils/formatDate";

  const { data } = $props();
  const { cube, vendorLinks, features } = $derived(data);
</script>

<section class="mx-auto max-w-6xl space-y-8 px-6 py-12">
  <header class="space-y-3">
    <h1 class="font-clash text-4xl font-semibold">{cube.name}</h1>
  </header>

  <div class="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_20rem]">
    <main class="space-y-6">
      <figure class="rounded-2xl border border-base-300 bg-base-200 p-6">
        <img
          src={cube.image_url}
          alt={cube.name}
          class="mx-auto max-h-96 w-full object-contain"
        />
      </figure>

      <section class="rounded-2xl border border-base-300 p-6">
        <h2 class="mb-5 text-xl font-semibold">Cube details</h2>

        <dl class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt class="text-sm text-base-content/60">Brand</dt>
            <dd class="font-medium">{cube.brand}</dd>
          </div>
          <div>
            <dt class="text-sm text-base-content/60">Type</dt>
            <dd class="font-medium">{cube.type}</dd>
          </div>
          <div>
            <dt class="text-sm text-base-content/60">Subtype</dt>
            <dd class="font-medium">{cube.sub_type ?? "Not provided"}</dd>
          </div>
          <div>
            <dt class="text-sm text-base-content/60">Version</dt>
            <dd class="font-medium">{cube.version_type}</dd>
          </div>
          <div>
            <dt class="text-sm text-base-content/60">Size</dt>
            <dd class="font-medium">{cube.size ?? "Not provided"}</dd>
          </div>
          <div>
            <dt class="text-sm text-base-content/60">Weight</dt>
            <dd class="font-medium">
              {cube.weight ? `${cube.weight} g` : "Not provided"}
            </dd>
          </div>
          <div>
            <dt class="text-sm text-base-content/60">Surface</dt>
            <dd class="font-medium">
              {cube.surface_finish ?? "Not provided"}
            </dd>
          </div>
          <div>
            <dt class="text-sm text-base-content/60">Release date</dt>
            <dd class="font-medium">
              {cube.release_date ?? "Not provided"}
            </dd>
          </div>
        </dl>
      </section>

      <section class="rounded-2xl border border-base-300 p-6">
        <h2 class="mb-4 text-xl font-semibold">Features</h2>

        {#if features.length}
          <div class="flex flex-wrap gap-2">
            {#each features as item (item.feature)}
              <span class="badge badge-outline">{item.feature}</span>
            {/each}
          </div>
        {:else}
          <p class="text-base-content/60">No features selected.</p>
        {/if}
      </section>

      <section class="rounded-2xl border border-base-300 p-6">
        <h2 class="mb-4 text-xl font-semibold">Vendor links</h2>

        {#if vendorLinks.length}
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Price</th>
                  <th>Available</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {#each vendorLinks as link (`${link.vendor_name}-${link.url}`)}
                  <tr>
                    <td>{link.vendor_name}</td>
                    <td>{link.price}</td>
                    <td>{link.available ? "Yes" : "No"}</td>
                    <td>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        class="link"
                      >
                        Open
                      </a>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p class="text-base-content/60">No vendor links provided.</p>
        {/if}
      </section>
    </main>

    <aside class="space-y-6 lg:sticky lg:top-24">
      <section class="rounded-2xl border border-base-300 bg-base-200 p-6">
        <h2 class="mb-4 text-xl font-semibold">Submission</h2>

        <dl class="space-y-4">
          <div>
            <dt class="text-sm text-base-content/60">Submitted by</dt>
            <dd class="font-medium">
              {cube.submitter?.display_name ?? "Unknown user"}
            </dd>
          </div>
          <div>
            <dt class="text-sm text-base-content/60">Submitted at</dt>
            <dd class="font-medium">{formatDate(cube.created_at)}</dd>
          </div>
          <div>
            <dt class="text-sm text-base-content/60">Status</dt>
            <dd class="badge badge-warning">{cube.status}</dd>
          </div>
        </dl>
      </section>

      {#if cube.status === "Pending"}
        <section class="rounded-2xl border border-base-300 p-6">
          <h2 class="mb-2 text-xl font-semibold">Decision</h2>
          <p class="mb-4 text-sm text-base-content/60">
            Confirm that the submitted information is accurate.
          </p>

          <SubmissionStatusManager submission={cube} entityLabel="cube" />
        </section>
      {/if}
    </aside>
  </div>
</section>
