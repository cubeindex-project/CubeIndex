<script lang="ts">
  import Card from "../layout/card.svelte";
  const { title = "YouTube video", videoUrl, onCancel } = $props();
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
