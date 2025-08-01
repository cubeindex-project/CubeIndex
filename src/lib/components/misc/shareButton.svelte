<script lang="ts">
  export let url: string = '';
  export let text: string = 'Check this out!';
  export let label: string = 'Share';
  export let btnClass: string = 'btn btn-accent';

  async function shareCurrent() {
    if (!url) url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, text, url });
        return;
      } catch (err) {
        console.error('Share failed', err);
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard');
    } catch (err) {
      console.error('Copy failed', err);
      prompt('Copy this link:', url);
    }
  }
</script>

<button class={btnClass} type="button" onclick={shareCurrent} aria-label={label}>
  <i class="fa-solid fa-share"></i>
  <span class="ml-2">{label}</span>
</button>
