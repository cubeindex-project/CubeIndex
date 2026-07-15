<script lang="ts">
  import { resolve } from "$app/paths";
  import type { Tables } from "$lib/types/database.types";
  import { getCurrencySymbol } from "$lib/utils/getCurrencySymbol";
  import { getFlagEmoji } from "$lib/utils/getFlagEmoji";
  import MissingSubmissionValue from "./MissingSubmissionValue.svelte";
  import SubmissionReview, {
    type SubmissionReviewUsers,
  } from "./SubmissionReview.svelte";

  interface VendorSubmission extends Tables<"vendors">, SubmissionReviewUsers {}

  interface Props {
    vendor: VendorSubmission;
  }

  let { vendor }: Props = $props();
</script>

<SubmissionReview
  submission={vendor}
  entityLabel="vendor"
  editHref={resolve("/(admin)/staff/vendors/edit/[slug]", {
    slug: vendor.slug,
  })}
>
  <tr>
    <th>Homepage</th>
    <td>
      <a
        class="link break-all"
        href={vendor.base_url}
        target="_blank"
        rel="noreferrer external">{vendor.base_url}</a
      >
    </td>
  </tr>
  <tr>
    <th>Country</th>
    <td>{vendor.country_iso}: {getFlagEmoji(vendor.country_iso)}</td>
  </tr>
  <tr>
    <th>Currency</th>
    <td>{vendor.currency}: {getCurrencySymbol(vendor.currency)}</td>
  </tr>
  <tr>
    <th>Logo</th>
    <td>
      {#if vendor.logo_url}
        <a
          class="inline-flex items-center gap-3 link"
          href={vendor.logo_url}
          target="_blank"
          rel="noreferrer external"
        >
          <img
            class="size-16 rounded border border-base-300 bg-base-100 object-contain"
            src={vendor.logo_url}
            alt={`${vendor.name} logo`}
          />
          Open logo
        </a>
      {:else}
        <MissingSubmissionValue />
      {/if}
    </td>
  </tr>
</SubmissionReview>
