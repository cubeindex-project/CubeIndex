<script>
  let isOpen = $state(true);
  function dismiss() {
    isOpen = false;
  }
</script>

{#if isOpen}
  <div
    class="relative flex flex-col sm:flex-row items-center sm:justify-between p-4 bg-base-100 w-full mx-auto pt-4"
  >
    <p class="text-center sm:text-left flex-1">
      🚧 <strong>CubeIndex</strong> is in Early Preview — This is an early version
      and currently in active development. Features and design are still evolving.
    </p>

    <button
      class="sm:static absolute right-6 top-3 sm:top-auto sm:ml-4 text-xl cursor-pointer"
      aria-label="Close"
      onclick={dismiss}
    >
      <i class="fa-solid fa-xmark"></i>
    </button>
  </div>
{/if}
