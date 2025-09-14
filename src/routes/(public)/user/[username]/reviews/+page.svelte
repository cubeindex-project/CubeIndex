<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { profile } = data;
</script>

<svelte:head>
  <title>{profile.display_name}'s Reviews - CubeIndex</title>
</svelte:head>

<div class="col-span-full flex flex-col items-center justify-center py-20">
  <i class="fa-solid fa-magnifying-glass fa-3x mb-4"></i>
  <h2 class="text-2xl font-semibold mb-2">Reviews Coming Soon.</h2>
</div>
