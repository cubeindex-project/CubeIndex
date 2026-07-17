<script lang="ts">
  import { resolve } from "$app/paths";
  import type { Tables } from "$lib/types/database.types";
  import MissingSubmissionValue from "./MissingSubmissionValue.svelte";
  import SubmissionReview, {
    type SubmissionReviewUsers,
  } from "./SubmissionReview.svelte";

  type CubeSubmission = Tables<"v_detailed_cube_models"> &
    SubmissionReviewUsers;

  interface Props {
    cube: CubeSubmission;
    features: { feature: string }[];
    vendorLinks: {
      vendor_name: string;
      price: number;
      available: boolean;
      url: string;
    }[];
  }

  let { cube, features, vendorLinks }: Props = $props();
</script>

<SubmissionReview
  submission={cube}
  entityLabel="cube"
  editHref={resolve("/(admin)/staff/cubes/edit/[slug]", { slug: cube.slug })}
>
  <tr>
    <th>Brand</th>
    <td>
      {cube.brand}
    </td>
  </tr>
  <tr>
    <th>Type</th>
    <td>
      {cube.type}
    </td>
  </tr>
  <tr>
    <th>Subtype</th>
    <td>
      {cube.sub_type}
    </td>
  </tr>
  <tr>
    <th>Version</th>
    <td>
      {cube.version_type}
    </td>
  </tr>
  <tr>
    <th>Series</th>
    <td>
      {#if cube.series}
        {cube.series}
      {:else}
        <MissingSubmissionValue />
      {/if}
    </td>
  </tr>
  <tr>
    <th>Related cube</th>
    <td>
      {#if cube.related_to}
        {cube.related_to}
      {:else}
        <MissingSubmissionValue />
      {/if}
    </td>
  </tr>
  <tr>
    <th>Release date</th>
    <td>
      {#if cube.release_date}
        {cube.release_date}
        {#if cube.release_date_precision}
          <span class="badge badge-ghost badge-sm ml-1">
            {cube.release_date_precision} precision
          </span>
        {/if}
      {:else}
        <MissingSubmissionValue />
      {/if}
    </td>
  </tr>
  <tr>
    <th>Size</th>
    <td>
      {#if cube.size}
        {cube.size}
      {:else}
        <MissingSubmissionValue />
      {/if}
    </td>
  </tr>
  <tr>
    <th>Weight</th>
    <td>
      {#if cube.weight !== null}
        {cube.weight} g
      {:else}
        <MissingSubmissionValue />
      {/if}
    </td>
  </tr>
  <tr>
    <th>Surface</th>
    <td>
      {#if cube.surface_finish}
        {cube.surface_finish}
      {:else}
        <MissingSubmissionValue />
      {/if}
    </td>
  </tr>
  <tr>
    <th>Discontinued</th>
    <td>{cube.discontinued ? "Yes" : "No"}</td>
  </tr>
  <tr>
    <th>Image</th>
    <td>
      {#if cube.image_url}
        <a
          class="inline-flex items-center gap-3 link"
          href={cube.image_url}
          target="_blank"
          rel="noreferrer external"
        >
          <img
            class="size-16 rounded border border-base-300 bg-base-100 object-contain"
            src={cube.image_url}
            alt={cube.name}
          />
          Open image
        </a>
      {:else}
        <MissingSubmissionValue />
      {/if}
    </td>
  </tr>
  <tr>
    <th>Features</th>
    <td>
      {#if features.length}
        <div class="flex flex-wrap gap-1">
          {#each features as item, index (index)}
            <span class="badge badge-outline badge-sm">{item.feature}</span>
          {/each}
        </div>
      {:else}
        None
      {/if}
    </td>
  </tr>
  <tr>
    <th>Vendor links</th>
    <td>
      {#if vendorLinks.length}
        <div class="overflow-x-auto">
          <table class="table table-xs">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Price</th>
                <th>Available</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {#each vendorLinks as link, index (index)}
                <tr>
                  <td>{link.vendor_name}</td>
                  <td>{link.price}</td>
                  <td>{link.available ? "Yes" : "No"}</td>
                  <td>
                    <a
                      class="link"
                      href={link.url}
                      target="_blank"
                      rel="noreferrer external">Open</a
                    >
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        None
      {/if}
    </td>
  </tr>
</SubmissionReview>
