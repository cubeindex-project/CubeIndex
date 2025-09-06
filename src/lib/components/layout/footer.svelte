<footer
  class="relative overflow-hidden bg-base-100 px-6 pt-12 h-full"
  aria-label="Footer"
>
  <!-- Background visuals: gradients + top accent line (no noise) -->
  <div
    aria-hidden="true"
    class="absolute inset-0 z-0 pointer-events-none select-none"
  >
    <div
      class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-base-content/20 to-transparent"
    ></div>
    <div
      class="absolute inset-0 bg-gradient-to-tr from-secondary/5 via-transparent to-primary/5"
    ></div>
    <div
      class="absolute inset-0 opacity-80
             bg-[radial-gradient(120%_60%_at_50%_100%,_var(--tw-gradient-stops))]
             from-primary/20 via-transparent to-transparent"
    ></div>
  </div>

  <div class="relative z-30">
    <div class="max-w-6xl mx-auto md:mt-[10%] grid grid-cols-1 md:grid-cols-4">
      <!-- Brand Info -->
      <div class="border-r border-base-200/60 bg-base-100/60 p-5">
        <a href="/">
          <div class="flex items-center gap-2 mb-4">
            <img
              src="/images/CubeIndex_Logo.webp"
              alt="CubeIndex logo"
              class="h-10 w-10 rounded-full"
              width="12"
              height="12"
              fetchpriority="high"
            />
            <span class="text-2xl font-clash font-bold">CubeIndex</span>
          </div>
          <p class="text-sm text-base-content/70">
            Track, explore and share your speedcube collection.
          </p>
        </a>
      </div>

      <!-- Site Links -->
      <div class="border-r border-base-200/60 bg-base-100/60 p-5">
        <h3
          class="font-semibold mb-3 uppercase tracking-wide text-xs text-base-content/70"
        >
          Navigation
        </h3>
        <ul class="space-y-2 text-sm">
          <li><a href="/" class="link link-hover">Home</a></li>
          <li><a href="/explore" class="link link-hover">Explore</a></li>
          <li>
            <a href="/achievements" class="link link-hover">Achievements</a>
          </li>
          <li>
            <a href="/notifications" class="link link-hover">Notifications</a>
          </li>
          <li><a href="/userbar" class="link link-hover">Userbar</a></li>
          <li><a href="/about" class="link link-hover">About</a></li>
        </ul>
      </div>

      <!-- Social -->
      <div class="border-r border-base-200/60 bg-base-100/60 p-5">
        <h3
          class="font-semibold mb-3 uppercase tracking-wide text-xs text-base-content/70"
        >
          Connect
        </h3>
        <ul class="space-y-2 text-sm">
          <li>
            <a
              href="/discord"
              target="_blank"
              rel="noopener noreferrer"
              class="link link-hover">Discord</a
            >
          </li>
          <li>
            <a
              href="https://github.com/Saterz/cubeindex"
              target="_blank"
              rel="noopener noreferrer"
              class="link link-hover">GitHub</a
            >
          </li>
          <li>
            <a
              href="https://twitter.com/thecubeindex"
              target="_blank"
              rel="noopener noreferrer"
              class="link link-hover">Twitter</a
            >
          </li>
          <li>
            <a href="mailto:thecubeindex@gmail.com" class="link link-hover"
              >Email</a
            >
          </li>
        </ul>
      </div>

      <!-- Legal -->
      <div class="bg-base-100/60 p-5">
        <h3
          class="font-semibold mb-3 uppercase tracking-wide text-xs text-base-content/70"
        >
          Legal
        </h3>
        <ul class="space-y-2 text-sm">
          <li><a href="/privacy" class="link link-hover">Privacy Policy</a></li>
          <li><a href="/report" class="link link-hover">Report</a></li>
          <li><a href="/tos" class="link link-hover">Terms of Service</a></li>
          <li><a href="/sitemap.xml" class="link link-hover">Sitemap</a></li>
        </ul>
      </div>
    </div>

    <div class="my-10 text-center text-xs text-base-content/70">
      &copy; 2025 - {new Date().getFullYear()} CubeIndex by
      <a
        href="https://saterz.dev"
        target="_blank"
        rel="noopener noreferrer"
        class="link">Saterz</a
      >. All rights reserved.
    </div>
  </div>

  <!-- Decorative Wordmark -->
  <div
    class="hidden md:block absolute inset-0 overflow-hidden pointer-events-none select-none z-10"
  >
    <!-- Glow layer -->
    <div
      aria-hidden="true"
      class="absolute inset-x-0 top-0 -translate-y-1/3 text-center text-[16vw]
             font-clash tracking-tight uppercase leading-none text-base-content/30 blur-2xl"
    >
      CubeIndex
    </div>

    <!-- Main gradient wordmark -->
    <div
      aria-hidden="true"
      class="absolute inset-x-0 top-0 -translate-y-1/3 text-center text-[16vw]
             font-clash tracking-tight uppercase leading-none
             text-transparent bg-clip-text
             bg-gradient-to-b from-base-content/30 via-base-content/15 to-transparent"
    >
      CubeIndex
    </div>
  </div>
</footer>
