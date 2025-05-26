<script lang="ts">
    const { featureName } = $props();
    const discordInvite = "https://discord.gg/76ExrEAE7s"
</script>

<section class="min-h-screen bg-black flex items-center justify-center px-6 py-12">
  <div class="relative max-w-md w-full bg-neutral-800/60 backdrop-blur-md rounded-3xl p-8 shadow-2xl ring-1 ring-white/10 text-center space-y-6">
    <!-- Icon -->
    <div class="mx-auto w-20 h-20 flex items-center justify-center bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full shadow-lg">
      <i class="fa-solid fa-triangle-exclamation text-3xl text-white"></i>
    </div>

    <!-- Headline -->
    <h1 class="text-3xl sm:text-4xl font-clash font-extrabold text-white">
      {featureName} Temporarily Disabled
    </h1>

    <!-- Explanatory text -->
    <p class="text-gray-300">
      We're working behind the scenes to bring it back online. Thanks for your patience!
    </p>

    <!-- Discord Link -->
    <a
      href={discordInvite}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-semibold transition-shadow shadow-lg hover:shadow-2xl"
    >
      <i class="fa-brands fa-discord text-xl"></i>
      Join our Discord for more info
    </a>

    <!-- Return Home Button -->
    <a
      href="/"
      class="inline-flex items-center justify-center gap-1 px-6 py-3 bg-neutral-700 hover:bg-neutral-600 rounded-full text-white font-semibold transition"
    >
      <i class="fa-solid fa-house"></i>
      Return Home
    </a>
  </div>
</section>
