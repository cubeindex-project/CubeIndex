<script>
    let isOpen = $state(true);
    function dismiss() {
        isOpen = false;
    }
</script>

{#if isOpen}
  <div class="relative flex flex-col sm:flex-row items-center sm:justify-between p-4 bg-black w-full mx-auto pt-4 text-white">
    <p class="text-center flex-1">
      CubeIndex is set to fully release in <strong>August 2025</strong>, but you can try the <strong>beta</strong> version now<a href="https://cubeindexbeta.netlify.app/" class="text-blue-600 hover:underline ml-1">by clicking here</a>! Features and design are subject to change.
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

