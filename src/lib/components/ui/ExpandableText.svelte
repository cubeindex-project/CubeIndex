<script lang="ts">
  interface Props {
    text: string;
    threshold?: number;
    class?: string;
  }

  let { text, threshold = 200, class: className }: Props = $props();

  let expanded = $state(false);

  const isTruncated = $derived(text.length > threshold);

  function truncate(value: string, limit: number): string {
    return value.length > limit ? `${value.slice(0, limit).trimEnd()}…` : value;
  }

  const displayedText = $derived(expanded ? text : truncate(text, threshold));
</script>

<div>
  <p class={className}>{displayedText}</p>

  {#if isTruncated}
    <button
      type="button"
      class="btn btn-ghost btn-sm mt-2"
      aria-expanded={expanded}
      onclick={() => (expanded = !expanded)}
    >
      {expanded ? "Show less" : "Show more"}
    </button>
  {/if}
</div>
