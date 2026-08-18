<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    title: string;
    subtitle: string;
    action?: Snippet;
  }

  const { title, subtitle, action }: Props = $props();
</script>

<header class="mb-6 flex flex-wrap items-end justify-between gap-3">
  <div>
    <h1 class="text-2xl font-extrabold tracking-tight">{title}</h1>
    <p class="text-sm text-base-content/70">{subtitle}</p>
  </div>

  {#if action}
    {@render action()}
  {/if}
</header>
