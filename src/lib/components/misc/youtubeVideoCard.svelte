<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  import Card from "../layout/card.svelte";
  const { title = m.misc_youtube_video_title_text(), videoUrl, onCancel } =
    $props();
</script>

<Card {onCancel} {title}>
  <iframe
    class="aspect-video w-[560px] max-w-full rounded-2xl"
    src={videoUrl}
    {title}
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen
  ></iframe>
</Card>
