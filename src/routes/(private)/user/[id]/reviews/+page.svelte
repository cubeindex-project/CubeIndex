<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-col items-center justify-center min-h-[200px]">
  <h3 class="text-2xl font-bold mb-4">Reviews Coming Soon</h3>
  <p class="text-gray-600">Check back later for user reviews and feedback!</p>
</div>
