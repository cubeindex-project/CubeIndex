<script lang="ts">
  interface Props {
    currentPage: number;
    totalPages: number;
  }

  let { currentPage = $bindable(), totalPages }: Props = $props();
  const popoverID = $props.id();
  const anchorName = `--page-jump-${popoverID}`;
  let requestedPage = $state<number | undefined>(currentPage);
  let pageInput = $state<HTMLInputElement | undefined>(undefined);
  let pageJumpPopover = $state<HTMLFormElement | undefined>(undefined);

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

  function goToRequestedPage() {
    if (requestedPage !== undefined) {
      currentPage = Math.min(Math.max(requestedPage, 1), totalPages);
    }

    pageJumpPopover?.hidePopover();
  }

  function focusPageJumpInput() {
    if (pageJumpPopover?.matches(":popover-open")) {
      requestedPage = currentPage;
      pageInput?.focus();
      pageInput?.select();
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
    <div class="join-item btn btn-lg">
      <button
        popovertarget={popoverID}
        style={`anchor-name: ${anchorName}`}
        aria-label={`Go to page; currently on page ${currentPage} of ${totalPages}`}
      >
        Page {currentPage} of {totalPages}
      </button>
      <form
        bind:this={pageJumpPopover}
        class="dropdown card bg-base-100 mb-3 w-64 shadow-xl"
        popover
        id={popoverID}
        style={`position-anchor: ${anchorName}; position-area: top`}
        ontoggle={focusPageJumpInput}
        onsubmit={(event) => {
          event.preventDefault();
          goToRequestedPage();
        }}
      >
        <div class="card-body gap-3 p-4">
          <label class="font-medium" for="page-jump">Go to page</label>
          <div class="join">
            <input
              bind:this={pageInput}
              bind:value={requestedPage}
              id="page-jump"
              class="input join-item w-full text-center"
              type="number"
              min="1"
              max={totalPages}
              step="1"
              required
              aria-label={`Go to page (1 to ${totalPages})`}
            />
            <button class="btn join-item" type="submit" aria-label="Go to page">
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </form>
    </div>
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
