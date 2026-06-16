<script lang="ts">
  import { inView, type InViewOptions } from "$lib/actions/inView";
  import type { Snippet } from "svelte";

  interface Props {
    once?: boolean;
    root?: Element | null;
    rootMargin?: string;
    threshold?: number | number[];
    children: Snippet;
  }

  /** Whether to keep content visible after first entry */
  const {
    once = true,
    root = null,
    rootMargin = "0px",
    threshold = 0,
    children,
  }: Props = $props();

  let show = $state(false);

  const options: InViewOptions = {
    root,
    rootMargin,
    threshold,
    once,
    onEnter: () => {
      show = true;
    },
    onLeave: () => {
      if (!once) show = false;
    },
  };
</script>

<div use:inView={options}>
  {#if show}
    {@render children()}
  {/if}
</div>
