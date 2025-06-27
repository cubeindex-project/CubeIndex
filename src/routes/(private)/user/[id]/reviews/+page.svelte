<script lang="ts">
  import type { PageData } from "./$types";
  import { m } from "$lib/paraglide/messages";

  let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-col items-center justify-center min-h-[200px]">
  <h3 class="text-2xl font-bold mb-4">{m.coming_soon()}</h3>
  <p class="text-gray-600">{m.check_back_later()}</p>
</div>
