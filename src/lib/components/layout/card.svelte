<script lang="ts">
  import { fade, scale } from "svelte/transition";

  const { children } = $props();
</script>

<div
  class="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm"
  role="none"
  transition:fade={{ duration: 120 }}
>
  <div
    class="card w-full max-w-xl mx-3 shadow-2xl rounded-3xl ring-1 ring-base-300/60 bg-base-100/90 backdrop-blur supports-[backdrop-filter]:bg-base-100/80"
    transition:scale={{ duration: 150, start: 0.95 }}
  >
    <div class="card-body">
      {@render children()}
    </div>
  </div>
</div>
