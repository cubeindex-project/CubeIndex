<script lang="ts">
  // Svelte 5 runes
  let online = $state(
    typeof navigator !== "undefined" ? navigator.onLine : false
  );
  let retrying = $state(false);
  let lastTriedAt: Date | null = $state(null);
  let storageUsage: number | null = $state(null);

  // Track online/offline + storage usage
  $effect(() => {
    if (typeof window === "undefined") return;
    const update = () => (online = navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    navigator.storage?.estimate?.().then((e) => {
      if (e && typeof e.usage === "number") storageUsage = e.usage;
    });

    // Keyboard: press "R" to retry
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "r" || e.key === "R") && !retrying) retry();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      window.removeEventListener("keydown", onKey);
    };
  });

  function retry() {
    retrying = true;
    lastTriedAt = new Date();
    // A brief delay lets the spinner render before reload
    setTimeout(() => location.reload(), 150);
  }

  function fmtBytes(n: number) {
    if (n < 1024) return `${n} B`;
    const units = ["KB", "MB", "GB", "TB"];
    let u = -1;
    do {
      n /= 1024;
      u++;
    } while (n >= 1024 && u < units.length - 1);
    return `${n.toFixed(1)} ${units[u]}`;
  }
</script>

<svelte:head>
  <title>Offline • CubeIndex</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="min-h-[70vh] flex items-center justify-center px-6">
  <div class="w-full max-w-lg relative">
    <!-- Subtle ring accent -->
    <div
      class="absolute inset-0 -z-10 blur-2xl opacity-20 rounded-3xl bg-gradient-to-br from-primary/40 via-accent/30 to-secondary/40"
    ></div>

    <div class="card bg-base-100 shadow-2xl border border-base-200">
      <div class="card-body items-center text-center gap-4">
        <!-- Icon badge -->
        <div class="relative">
          <div
            class="w-16 h-16 grid place-items-center rounded-2xl bg-base-200 text-primary"
          >
            <i class="fa-solid fa-wifi fa-xl" aria-hidden="true"></i>
          </div>

          <!-- Online status chip -->
          <span
            class="absolute -right-2 -bottom-2 badge badge-lg border-0"
            class:badge-error={!online}
            class:badge-success={online}
            aria-live="polite"
          >
            {online ? "Online" : "Offline"}
          </span>
        </div>

        <h1 class="text-3xl font-bold tracking-tight">You’re offline</h1>
        <p class="text-base-content/70 max-w-md">
          Some features require an internet connection. You can still browse any
          pages that were cached on your device.
        </p>

        <!-- Actions -->
        <div class="join mt-2">
          <a href="/" class="btn btn-primary join-item"> Go home </a>
          <button
            class="btn join-item"
            onclick={retry}
            disabled={retrying}
            aria-busy={retrying}
          >
            {#if retrying}
              <span
                class="loading loading-spinner loading-sm mr-2"
                aria-hidden="true"
              ></span>
              Retrying…
            {:else}
              Retry
            {/if}
          </button>
        </div>

        <!-- Quick tips -->
        <ul class="text-sm text-base-content/70 space-y-1 mt-4">
          <li>• Check Wi-Fi or mobile data.</li>
          <li>• Disable Airplane mode and VPN if applicable.</li>
          <li>• If the issue persists, close and reopen the app.</li>
        </ul>

        <!-- Tiny diagnostics line -->
        <div class="text-xs text-base-content/60 mt-3">
          {#if storageUsage !== null}
            Cached data: {fmtBytes(storageUsage)} •
          {/if}
          Last attempt: {lastTriedAt ? lastTriedAt.toLocaleTimeString() : "—"} •
          Shortcut: press <kbd class="kbd kbd-xs">R</kbd> to retry
        </div>
      </div>
    </div>
  </div>
</section>
