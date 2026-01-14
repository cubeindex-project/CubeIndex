<script lang="ts">
  import { m } from "$lib/paraglide/messages";

  const { label, gradient }: { label: string; gradient: string } = $props();
</script>

<span
  class={`px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${gradient} text-white select-none`}
  aria-label={m.misc_tag_feature_status_aria({ label })}
>
  {label}
</span>
