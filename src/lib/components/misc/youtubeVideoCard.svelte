<script lang="ts">
  import Modal from "$lib/components/ui/Modal.svelte";

  interface Props {
    open: boolean;
    title?: string;
    videoURL: string;
  }

  let {
    open = $bindable(),
    title = "YouTube video",
    videoURL,
  }: Props = $props();
</script>

<Modal bind:open {title}>
  <iframe
    class="aspect-video w-full rounded-2xl"
    src={videoURL}
    {title}
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen
  ></iframe>

  <div class="modal-action sm:justify-end">
    <button
      type="button"
      class="btn flex-1 sm:flex-none"
      onclick={() => (open = false)}
    >
      Close
    </button>
  </div>
</Modal>
