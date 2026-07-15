<script lang="ts">
  import type { Tables } from "$lib/types/database.types";

  interface Props {
    vendor: Pick<Tables<"vendors">, "logo_url" | "name">;
  }

  const { vendor }: Props = $props();
</script>

{#if vendor.logo_url}
  <div class="avatar">
    <div class="w-16 rounded-xl">
      <img
        src={vendor.logo_url}
        alt={`${vendor.name}'s logo`}
        class="p-1 object-contain"
        loading="lazy"
        decoding="async"
      />
    </div>
  </div>
{:else}
  <div
    class="avatar avatar-placeholder"
    role="img"
    aria-label={`${vendor.name}'s placeholder logo`}
  >
    <div class="w-16 rounded-xl bg-neutral text-neutral-content">
      <span
        class="font-clash text-2xl font-semibold uppercase"
        aria-hidden="true"
      >
        {vendor.name.charAt(0)}
      </span>
    </div>
  </div>
{/if}
