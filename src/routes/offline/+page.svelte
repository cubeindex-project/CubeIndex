<svelte:head>
  <title>Offline • CubeIndex</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="min-h-[60vh] flex items-center justify-center px-6">
  <div class="max-w-md text-center">
    <div class="mb-6">
      <div class="mx-auto mb-4 w-16 h-16 grid place-items-center rounded-full bg-base-200 text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
          <path d="M12 6a9 9 0 0 0-9 9h3a6 6 0 1 1 12 0h3a9 9 0 0 0-9-9Zm0 3a6 6 0 0 0-6 6h3a3 3 0 1 1 6 0h3a6 6 0 0 0-6-6Z"/>
        </svg>
      </div>
      <h1 class="text-2xl font-semibold">You’re offline</h1>
      <p class="mt-2 text-base-content/70">
        Some features require an internet connection.
      </p>
    </div>
    <div class="join">
      <a href="/" class="btn btn-primary join-item">Go home</a>
      <button class="btn join-item" on:click={() => location.reload()}>Retry</button>
    </div>
  </div>
</section>
