<script lang="ts">
  import { m } from "$lib/paraglide/messages";

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
      aria-label={m.misc_pagination_previous_aria()}
    >
      <i class="fa-solid fa-chevron-left sm:mr-2"></i>
      <span class="hidden sm:block">{m.misc_pagination_previous_label()}</span>
    </button>
    <button class="join-item btn btn-lg">
      {m.misc_pagination_page_text({ currentPage, totalPages })}
    </button>
    <button
      onclick={goToNextPage}
      class="join-item btn btn-lg"
      disabled={currentPage === totalPages}
      aria-label={m.misc_pagination_next_aria()}
    >
      <span class="hidden sm:block">{m.misc_pagination_next_label()}</span>
      <i class="fa-solid fa-chevron-right sm:ml-2"></i>
    </button>
  </div>
</div>
