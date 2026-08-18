<script lang="ts">
  import type { Enums } from "$lib/types/database.types";

  interface Props {
    version_type: Enums<"cube_version_types">;
  }

  const { version_type }: Props = $props();

  const bgColor = $derived(
    version_type === "Base"
      ? "badge-primary"
      : version_type === "Variant"
        ? "badge-secondary"
        : "badge-accent",
  );
</script>

<span class="badge {bgColor}">
  <span class="font-clash uppercase">{version_type}</span>
</span>
