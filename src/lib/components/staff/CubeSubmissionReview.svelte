<script lang="ts">
  import { resolve } from "$app/paths";
  import type { Tables } from "$lib/types/database.types";
  import MissingSubmissionValue from "./MissingSubmissionValue.svelte";
  import SubmissionReview from "./SubmissionReview.svelte";

  interface CubeSubmission extends Tables<"cube_submissions"> {
    submission: Tables<"submissions"> & {
      submitter: Pick<Tables<"profiles">, "display_name"> | null;
      reviewer: Pick<Tables<"profiles">, "display_name"> | null;
    };
    brand: Pick<Tables<"brands">, "name"> | null;
    type: Pick<Tables<"cube_types">, "name"> | null;
    series: Pick<Tables<"cube_series">, "name"> | null;
    relatedCube: Pick<Tables<"cube_models">, "name"> | null;
    targetCube: Pick<Tables<"cube_models">, "slug" | "name"> | null;
  }

  interface Props {
    cube: CubeSubmission;
    features: Pick<Tables<"cube_features">, "label">[];
    vendorLinks: {
      price: number;
      available: boolean;
      url: string;
      vendor: Pick<Tables<"vendors">, "name">;
    }[];
  }

  let { cube, features, vendorLinks }: Props = $props();

  const submission = $derived({
    id: cube.submission.id,
    name: cube.name,
    status: cube.submission.status,
    staff_note: cube.submission.reviewer_note,
    created_at: cube.submission.submitted_at,
    verified_at: cube.submission.reviewed_at,
    submitter: cube.submission.submitter,
    verifier: cube.submission.reviewer,
  });
</script>

{#snippet proposedBadge()}
  <span class="badge badge-info badge-sm">Proposed</span>
{/snippet}

<SubmissionReview {submission} entityLabel="cube">
  <tr>
    <th>Operation</th>
    <td class="capitalize">{cube.submission.operation}</td>
  </tr>
  {#if cube.targetCube}
    <tr>
      <th>Target cube</th>
      <td>
        <a
          href={resolve("/(public)/explore/cubes/[slug]", {
            slug: cube.targetCube.slug,
          })}
          class="link"
        >
          {cube.targetCube.name}
        </a>
      </td>
    </tr>
  {/if}
  <tr>
    <th>Brand</th>
    <td>
      {#if cube.brand}
        {cube.brand.name}
      {:else if cube.proposed_brand_name}
        {cube.proposed_brand_name}
        {@render proposedBadge()}
      {:else}
        <MissingSubmissionValue />
      {/if}
    </td>
  </tr>
  <tr>
    <th>Type</th>
    <td>
      {#if cube.type}
        {cube.type.name}
      {:else if cube.proposed_type_name}
        {cube.proposed_type_name}
        {@render proposedBadge()}
      {:else}
        <MissingSubmissionValue />
      {/if}
    </td>
  </tr>
  <tr>
    <th>Subtype</th>
    <td>{cube.sub_type}</td>
  </tr>
  <tr>
    <th>Version</th>
    <td>{cube.version_type}</td>
  </tr>
  <tr>
    <th>Series</th>
    <td>
      {#if cube.series}
        {cube.series.name}
      {:else if cube.proposed_series_name}
        {cube.proposed_series_name}
        {@render proposedBadge()}
      {:else}
        <MissingSubmissionValue />
      {/if}
    </td>
  </tr>
  <tr>
    <th>Related cube</th>
    <td>
      {#if cube.relatedCube}
        {cube.relatedCube.name}
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
        {cube.size} mm
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
  {#if cube.submission.submitter_note}
    <tr>
      <th>Submitter note</th>
      <td class="whitespace-pre-wrap">{cube.submission.submitter_note}</td>
    </tr>
  {/if}
  <tr>
    <th>Image</th>
    <td>
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
    </td>
  </tr>
  <tr>
    <th>Features</th>
    <td>
      {#if features.length}
        <div class="flex flex-wrap gap-1">
          {#each features as feature, index (index)}
            <span class="badge badge-outline badge-sm">{feature.label}</span>
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
              {#each vendorLinks as link (link.url)}
                <tr>
                  <td>{link.vendor.name}</td>
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
