<script lang="ts">
  import { resolve } from "$app/paths";
  import type { Tables } from "$lib/types/database.types";
  import { getSubmissionStatusBadgeColor } from "$lib/utils/getSubmissionStatusBadgeColor";
  import VendorLogo from "$lib/components/vendors/VendorLogo.svelte";

  interface StaffVendor extends Tables<"vendors"> {
    submitter: Pick<Tables<"profiles">, "display_name"> | null;
  }

  interface Props {
    vendor: StaffVendor;
  }

  const { vendor }: Props = $props();
</script>

<article class="card border border-base-300 bg-base-200 shadow-sm">
  <div class="card-body gap-4">
    <div class="flex items-center gap-4">
      <VendorLogo {vendor} />
      <div class="min-w-0 flex-1">
        <h2 class="card-title truncate" title={vendor.name}>{vendor.name}</h2>
        <span class="badge {getSubmissionStatusBadgeColor(vendor.status)}">
          {vendor.status}
        </span>
      </div>
    </div>

    <p class="flex items-center gap-2 text-sm text-base-content/70">
      <i class="fa-solid fa-user" aria-hidden="true"></i>
      Submitted by
      {vendor.submitter?.display_name ?? "Unknown user"}
    </p>

    <div class="card-actions mt-auto justify-end">
      {#if vendor.status === "Approved"}
        <a
          class="btn btn-primary btn-sm"
          href={resolve("/(admin)/staff/vendors/edit/[slug]", {
            slug: vendor.slug,
          })}
        >
          <i class="fa-solid fa-pencil" aria-hidden="true"></i>
          Edit
        </a>
      {:else}
        <a
          class="btn btn-primary btn-sm"
          href={resolve("/(admin)/staff/vendors/review/[slug]", {
            slug: vendor.slug,
          })}
        >
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          Review
        </a>
      {/if}
    </div>
  </div>
</article>
