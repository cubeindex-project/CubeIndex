<script lang="ts">
  /**
   * open: whether the modal is visible
   * onConfirm: called when user confirms sign-out
   * onCancel: called when user cancels
   */
  //   export let open: boolean;
  //   export let onConfirm: () => void;
  //   export let onCancel: () => void;

  let { onCancel } = $props();
</script>

<div
  class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
>
  <div
    class="bg-neutral-900 rounded-3xl shadow-2xl p-8 w-full max-w-md text-center space-y-8"
  >
    <h2 class="text-2xl font-clash font-bold text-white mb-2">
      Confirm Sign Out
    </h2>
    <p class="text-gray-300 text-lg">Are you sure you want to sign out?</p>
    <div class="flex justify-center gap-6 mt-6">
      <button
        type="button"
        onclick={onCancel}
        class="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition text-base font-semibold cursor-pointer"
      >
        Cancel
      </button>
      <a
        type="button"
        href="/auth/logout"
        class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-base font-semibold cursor-pointer"
      >
        Sign Out
      </a>
    </div>
  </div>
</div>
