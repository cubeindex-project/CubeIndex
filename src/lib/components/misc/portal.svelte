<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  const { children } = $props();

  let portal: HTMLDivElement;

  onMount(() => {
    document.body.appendChild(portal);
  });

  onDestroy(() => {
    portal.remove();
  });
</script>

<div bind:this={portal}>
  {@render children()}
</div>
