<script lang="ts">
  import type { Tables } from "$lib/types/database.types";
  import { getCurrencySymbol } from "$lib/utils/getCurrencySymbol";
  import { getFlagEmoji } from "$lib/utils/getFlagEmoji";
  import VendorLogo from "./VendorLogo.svelte";

  interface Props {
    vendor: Tables<"v_detailed_vendors">;
  }

  const { vendor }: Props = $props();
</script>

<section
  class="group relative grid rounded-2xl border border-base-300 bg-base-200 shadow-sm transition focus-within:shadow-md"
  role="group"
>
  <header class="flex items-start gap-4 p-6 pb-4">
    <VendorLogo {vendor} />

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-base/none" aria-hidden="true">
          {getFlagEmoji(vendor.country_iso)}
        </span>
        <h2 class="truncate text-lg font-semibold" title={vendor.name}>
          {vendor.name}
        </h2>

        {#if vendor.sponsored}
          <span
            class="inline-flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-900"
          >
            <i class="fa-solid fa-star"></i>
            Sponsored
          </span>
        {/if}
      </div>
    </div>
  </header>

  <hr class="mx-6 border-base-300/60" />

  <div class="p-6 pt-4">
    <div class="grid gap-2 sm:grid-cols-2">
      <div class="inline-flex items-center gap-2 text-sm">
        <div class="min-w-0">
          <div class="font-medium">
            {getCurrencySymbol(vendor.currency)}
            <span class="text-base-content/60 ml-1">{vendor.currency}</span>
          </div>
          <div class="text-xs text-base-content/60">Default currency</div>
        </div>
      </div>
    </div>
  </div>

  <hr class="mx-6 border-base-300/60" />

  <div
    class="flex justify-between items-center gap-6 p-6 pt-4 text-xs text-base-content/70"
  >
    <div class="flex items-center gap-2">
      <i class="fa-solid fa-user-check" aria-hidden="true"></i>
      <span>
        {vendor.buyer_count}
        user{vendor.buyer_count === 1 ? "" : "s"} purchased here
      </span>
    </div>
  </div>

  <hr class="mx-6 border-base-300/60" />

  <footer class="p-6 pt-4">
    <a
      href={vendor.base_url}
      target="_blank"
      rel="noopener noreferrer external"
      class="btn btn-primary w-full"
    >
      Visit Store
    </a>
  </footer>
</section>
