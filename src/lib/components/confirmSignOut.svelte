<script lang="ts">
  let { onCancel } = $props();
</script>

<div
  class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
>
  <div
    class="bg-base-300 rounded-3xl shadow-2xl p-8 w-full max-w-md text-center space-y-8"
  >
    <h2 class="text-2xl font-clash font-bold mb-2">
      Confirm Sign Out
    </h2>
    <p class="text-lg">Are you sure you want to sign out?</p>
    <div class="flex justify-center gap-6 mt-6">
      <a
        type="button"
        href="/auth/logout"
        class="btn btn-primary btn-lg"
      >
        Sign Out
      </a>
      <button
        type="button"
        onclick={onCancel}
        class="btn btn-secondary btn-lg"
      >
        Cancel
      </button>
    </div>
  </div>
</div>
