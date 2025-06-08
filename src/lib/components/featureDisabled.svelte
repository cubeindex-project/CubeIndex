<script lang="ts">
  const { featureName } = $props();
  const discordInvite = "https://discord.gg/76ExrEAE7s";
</script>

<section class="min-h-screen flex items-center justify-center px-6 py-12">
  <div
    class="relative max-w-md w-full bg-base-200 backdrop-blur-md rounded-3xl p-8 shadow-2xl ring-1 ring-base-300 text-center space-y-6"
  >
    <!-- Icon -->
    <div
      class="mx-auto w-20 h-20 flex items-center justify-center bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full shadow-lg"
    >
      <i class="fa-solid fa-triangle-exclamation text-3xl text-white"></i>
    </div>

    <!-- Headline -->
    <h1 class="text-3xl sm:text-4xl font-clash font-extrabold">
      {featureName} Temporarily Disabled
    </h1>

    <!-- Explanatory text -->
    <p>
      We're working behind the scenes to bring it back online. Thanks for your
      patience!
    </p>

    <a
      href={discordInvite}
      target="_blank"
      rel="noopener noreferrer"
      class="btn btn-lg bg-primary text-primary-content"
    >
      <i class="fa-brands fa-discord text-xl"></i>
      Join our Discord for more info
    </a>

    <!-- Return Home Button -->
    <a href="/" class="btn btn-lg bg-base-300">
      <i class="fa-solid fa-house"></i>
      Return Home
    </a>
  </div>
</section>
