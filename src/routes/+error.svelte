<script lang="ts">
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
  import type { ResolvedPathname } from "$app/types";

  function getReportURL(): ResolvedPathname {
    const searchParams = new URLSearchParams({
      error: page.error?.message ?? "",
      affectedURL: page.url.href,
      requestID: page.error?.reqId ?? "",
    });

    return resolve(`/report?${searchParams.toString()}`);
  }
</script>

<section
  class="relative flex min-h-screen flex-col items-center justify-center px-6 text-center grid-bg overflow-hidden"
>
  <div class="relative z-10">
    <h1 class="font-clash text-[6rem] sm:text-[8rem] font-black text-primary">
      {page.status}
    </h1>
    <p class="flex flex-col items-center mb-6">
      <span class="text-xl font-medium sm:text-2xl">
        {page.error?.message ?? "Something went wrong!"}
      </span>
      {#if page.error?.reqId}
        <span>
          Request ID: {page.error.reqId}
        </span>
      {/if}
    </p>
  </div>

  <p class="mb-8 max-w-md relative z-10">
    It seems you encountered an error.<br />
    If you think this is a bug, please let us know!
  </p>

  <div
    class="flex flex-col sm:flex-row gap-4 justify-center mb-4 z-10 relative"
  >
    <a href={resolve("/")} class="btn btn-lg btn-primary"> 🏠 Return Home </a>
    <a class="btn btn-lg btn-error" href={getReportURL()}>
      🐞 Report the Bug
    </a>
  </div>
</section>
