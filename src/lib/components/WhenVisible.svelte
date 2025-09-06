<script lang="ts">
  import { inView, type InViewOptions } from "$lib/actions/inView";

  /** Whether to keep content visible after first entry */
  export let once: boolean = true;
  export let root: Element | null = null;
  export let rootMargin: string = "0px";
  export let threshold: number | number[] = 0;

  let show = false;

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
    <slot />
  {/if}
</div>

<style>
  /* no-op: wrapper is minimal and inherits layout from slot */
</style>
