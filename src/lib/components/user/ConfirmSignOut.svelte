<script lang="ts">
  import { resolve } from "$app/paths";
  import Modal from "$lib/components/ui/Modal.svelte";

  interface Props {
    open: boolean;
  }

  let { open = $bindable() }: Props = $props();
</script>

<Modal
  bind:open
  title="Confirm Sign Out"
  description="Are you sure you want to sign out?"
>
  <div class="modal-action flex gap-3 sm:justify-end">
    <button
      type="button"
      class="btn flex-1 sm:flex-none"
      onclick={() => (open = false)}
    >
      Cancel
    </button>

    <a
      href={resolve("/auth/logout")}
      class="btn btn-error flex-1 sm:flex-none"
    >
      Sign Out
    </a>
  </div>
</Modal>
