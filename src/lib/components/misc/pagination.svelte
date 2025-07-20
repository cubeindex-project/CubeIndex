<script lang="ts">
  let {
    currentPage = $bindable(),
    totalPages,
  }: { currentPage: number; totalPages: number } = $props();

  function goToPreviousPage() {
    if (currentPage > 1) {
      currentPage -= 1;
    }
  }

  function goToNextPage() {
    if (currentPage < totalPages) {
      currentPage += 1;
    }
  }
</script>

<div class="flex items-center justify-center gap-4">
  <div class="join">
    <button
      class="join-item btn btn-lg"
      onclick={goToPreviousPage}
      disabled={currentPage === 1}
      aria-label="Previous page"
    >
      <i class="fa-solid fa-chevron-left sm:mr-2"></i>
      <span class="hidden sm:block">Previous</span>
    </button>
    <button class="join-item btn btn-lg">
      Page {currentPage} of {totalPages}
    </button>
    <button
      onclick={goToNextPage}
      class="join-item btn btn-lg"
      disabled={currentPage === totalPages}
      aria-label="Next page"
    >
      <span class="hidden sm:block">Next</span>
      <i class="fa-solid fa-chevron-right sm:ml-2"></i>
    </button>
  </div>
</div>
