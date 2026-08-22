<script lang="ts">
  /**
   * The message to display when a value is unavailable.
   */
  interface Props {
    missingValueText: string;
  }

  const { missingValueText }: Props = $props();
</script>

<span class="text-sm text-warning">
  <i class="fa-solid fa-triangle-exclamation"></i>
  {missingValueText}
</span>
