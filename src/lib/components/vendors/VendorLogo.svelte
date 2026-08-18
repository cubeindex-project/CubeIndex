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
        class="p-2 object-contain bg-white"
        loading="lazy"
        decoding="async"
      />
    </div>
  </div>
{:else}
  <div class="avatar avatar-placeholder">
    <div
      class="w-16 rounded-xl bg-white"
      aria-label={`${vendor.name}'s placeholder logo`}
    >
      {vendor.name?.charAt(0)}
    </div>
  </div>
{/if}
