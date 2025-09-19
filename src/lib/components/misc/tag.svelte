<script lang="ts">
  const { label, gradient }: { label: string; gradient: string } = $props();
</script>

<span
  class={`px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${gradient} text-white select-none`}
  aria-label="Feature status: Beta"
>
  {label}
</span>
