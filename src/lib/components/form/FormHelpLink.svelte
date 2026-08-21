<script lang="ts">
  import type { ResolvedPathname } from "$app/types";

  interface Props {
    href: string;
    title: string;
  }

  let { href, title }: Props = $props();
</script>

<a href={href as ResolvedPathname} aria-label={`Learn more about ${title}`}>
  <i class="fa-regular fa-circle-question"></i>
</a>
