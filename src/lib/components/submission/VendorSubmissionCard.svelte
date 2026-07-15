<script lang="ts">
  import type { Tables } from "$lib/types/database.types";
  import { formatDate } from "$lib/utils/formatDate";
  import { getCurrencySymbol } from "$lib/utils/getCurrencySymbol";
  import { getFlagEmoji } from "$lib/utils/getFlagEmoji";
  import { getSubmissionStatusBadgeColor } from "$lib/utils/getSubmissionStatusBadgeColor";
  import VendorLogo from "$lib/components/vendors/VendorLogo.svelte";
  import StaffNote from "./StaffNote.svelte";

  interface Props {
    vendor: Tables<"vendors">;
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

    <dl
      class="grid grid-cols-2 gap-4 rounded-xl border border-base-300 bg-base-100/50 p-4"
    >
      <div>
        <dt class="text-xs text-base-content/60">Country</dt>
        <dd class="mt-1 flex items-center gap-2 font-medium">
          <span aria-hidden="true">{getFlagEmoji(vendor.country_iso)}</span>
          {vendor.country_iso}
        </dd>
      </div>
      <div>
        <dt class="text-xs text-base-content/60">Currency</dt>
        <dd class="mt-1 font-medium">
          {getCurrencySymbol(vendor.currency)}
          <span class="text-base-content/60">{vendor.currency}</span>
        </dd>
      </div>
      <div class="col-span-2 min-w-0">
        <dt class="text-xs text-base-content/60">Homepage</dt>
        <dd class="mt-1">
          <a
            href={vendor.base_url}
            target="_blank"
            rel="noreferrer external"
            class="link link-hover flex items-center gap-2 text-sm font-medium"
            title={vendor.base_url}
          >
            <span class="truncate">{vendor.base_url}</span>
            <i
              class="fa-solid fa-arrow-up-right-from-square shrink-0 text-xs"
              aria-hidden="true"
            ></i>
          </a>
        </dd>
      </div>
    </dl>

    <div class="flex flex-wrap gap-x-4 gap-y-2 text-xs text-base-content/60">
      <span class="flex items-center gap-1.5">
        <i class="fa-regular fa-calendar" aria-hidden="true"></i>
        Submitted
        <time datetime={vendor.created_at} class="text-base-content/80">
          {formatDate(vendor.created_at)}
        </time>
      </span>
      {#if vendor.verified_at}
        <span class="flex items-center gap-1.5">
          <i class="fa-solid fa-check" aria-hidden="true"></i>
          Reviewed
          <time datetime={vendor.verified_at} class="text-base-content/80">
            {formatDate(vendor.verified_at)}
          </time>
        </span>
      {/if}
    </div>

    {#if vendor.staff_note}
      <StaffNote staff_note={vendor.staff_note} />
    {/if}
  </div>
</article>
