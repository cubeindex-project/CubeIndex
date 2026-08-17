<script lang="ts">
  import { resolve } from "$app/paths";
  import Modal from "../ui/Modal.svelte";

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
  <div class="flex justify-center gap-6 mt-6">
    <a
      type="button"
      href={resolve("/auth/logout")}
      class="btn btn-primary btn-lg"
    >
      Sign Out
    </a>
		<button
			type="button"
			onclick={() => (open = false)}
			class="btn btn-secondary btn-lg"
		>
      Cancel
    </button>
  </div>
</Modal>
