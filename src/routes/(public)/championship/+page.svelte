<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  import InConstruction from "$lib/components/inConstruction.svelte";
</script>

<InConstruction />
