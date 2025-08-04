<script lang="ts">
  let {
    url,
    text = "Check this out!",
    label = "Share",
    btnClass = "btn btn-accent",
  }: {
    url: string;
    text?: string;
    label?: string;
    btnClass?: string;
  } = $props();

  async function shareCurrent() {
    if (!url) url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, text, url });
        return;
      } catch (err) {
        new Error("Share failed" + err);
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard");
    } catch (err) {
      new Error("Copy failed" + err);
      prompt("Copy this link:", url);
    }
  }
</script>

<button
  class={btnClass}
  type="button"
  onclick={shareCurrent}
  aria-label={label}
>
  <i class="fa-solid fa-share"></i>
  <span class="ml-2">{label}</span>
</button>
