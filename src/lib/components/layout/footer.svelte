<script>
  import { m } from "$lib/paraglide/messages";

  const startYear = 2025;
  const currentYear = new Date().getFullYear();
</script>

<footer
  class="relative overflow-hidden bg-base-100 px-6 pt-12 h-full"
  aria-label={m.footer_region_aria()}
  aria-label={m.footer_layout_region_label()}
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
              alt={m.nav_brand_logo_alt()}
              alt={m.footer_brand_logo_alt()}
              class="h-10 w-10 rounded-full"
              width="12"
              height="12"
              fetchpriority="high"
            />
            <span class="text-2xl font-clash font-bold">
              {m.footer_brand_name_text()}
            </span>
          </div>
          <p class="text-sm text-base-content/70">
            {m.footer_brand_description_text()}
              {m.app_brand_name_text()}
            </span>
          </div>
          <p class="text-sm text-base-content/70">
            {m.footer_brand_catch_phrase_text()}
          </p>
        </a>
      </div>

      <!-- Site Links -->
      <div class="border-r border-base-200/60 bg-base-100/60 p-5">
        <h3
          class="font-semibold mb-3 uppercase tracking-wide text-xs text-base-content/70"
        >
          {m.footer_navigation_heading_text()}
        </h3>
        <ul class="space-y-2 text-sm">
          <li><a href="/" class="link link-hover">{m.footer_home_label()}</a></li>
          <li>
            <a href="/explore" class="link link-hover">
              {m.nav_main_explore_label()}
            </a>
          </li>
          <li>
            <a href="/achievements" class="link link-hover">
              {m.footer_achievements_label()}
            </a>
          </li>
          <li>
            <a href="/report" class="link link-hover">
              {m.footer_report_label()}
            </a>
          </li>
          {m.footer_nav_section_title()}
        </h3>
        <ul class="space-y-2 text-sm">
          <li><a href="/" class="link link-hover">{m.footer_nav_home_label()}</a></li>
          <li>
            <a href="/explore" class="link link-hover">{m.footer_nav_explore_label()}</a>
          </li>
          <li>
            <a href="/achievements" class="link link-hover"
              >{m.footer_nav_achievements_label()}</a
            >
          </li>
          <li><a href="/report" class="link link-hover">{m.footer_nav_report_label()}</a></li>
        </ul>
      </div>

      <!-- Social -->
      <div class="border-r border-base-200/60 bg-base-100/60 p-5">
        <h3
          class="font-semibold mb-3 uppercase tracking-wide text-xs text-base-content/70"
        >
          {m.footer_connect_heading_text()}
          {m.footer_social_section_title()}
        </h3>
        <ul class="space-y-2 text-sm">
          <li>
            <a
              href="/discord"
              target="_blank"
              rel="noopener noreferrer"
              class="link link-hover">{m.footer_social_discord_label()}</a
            >
          </li>
          <li>
            <a
              href="https://github.com/cubeindex-project/CubeIndex"
              target="_blank"
              rel="noopener noreferrer"
              class="link link-hover">{m.footer_social_github_label()}</a
            >
          </li>
          <li>
            <a
              href="https://twitter.com/thecubeindex"
              target="_blank"
              rel="noopener noreferrer"
              class="link link-hover">{m.footer_social_twitter_label()}</a
            >
          </li>
          <li>
            <a
              href="https://www.youtube.com/@cubeindex"
              target="_blank"
              rel="noopener noreferrer"
              class="link link-hover">{m.footer_social_youtube_label()}</a
            >
          </li>
          <li>
            <a href="mailto:thecubeindex@gmail.com" class="link link-hover"
              >{m.footer_social_email_label()}</a
            >
          </li>
        </ul>
      </div>

      <!-- Legal -->
      <div class="bg-base-100/60 p-5">
        <h3
          class="font-semibold mb-3 uppercase tracking-wide text-xs text-base-content/70"
        >
          {m.footer_legal_heading_text()}
        </h3>
        <ul class="space-y-2 text-sm">
          <li>
            <a href="/tos" class="link link-hover">
              {m.footer_terms_label()}
            </a>
          </li>
          <li>
            <a href="/privacy" class="link link-hover">
              {m.footer_privacy_label()}
            </a>
          </li>
          <li>
            <a href="/sitemap.xml" class="link link-hover">
              {m.footer_sitemap_label()}
            </a>
          {m.footer_legal_section_title()}
        </h3>
        <ul class="space-y-2 text-sm">
          <li>
            <a href="/tos" class="link link-hover"
              >{m.footer_legal_terms_label()}</a
            >
          </li>
          <li>
            <a href="/privacy" class="link link-hover"
              >{m.footer_legal_privacy_label()}</a
            >
          </li>
          <li>
            <a href="/sitemap.xml" class="link link-hover"
              >{m.footer_legal_sitemap_label()}</a
            >
          </li>
        </ul>
      </div>
    </div>

    <div class="my-10 text-center text-xs text-base-content/70">
      {m.footer_copyright_text({
        startYear: 2025,
        endYear: new Date().getFullYear(),
      &copy;
      {m.footer_legal_copyright_text({
        startYear,
        currentYear,
        brandName: m.app_brand_name_text(),
      })}
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
      {m.footer_brand_name_text()}
      {m.app_brand_name_text()}
    </div>

    <!-- Main gradient wordmark -->
    <div
      aria-hidden="true"
      class="absolute inset-x-0 top-0 -translate-y-1/3 text-center text-[16vw]
             font-clash tracking-tight uppercase leading-none
             text-transparent bg-clip-text
             bg-gradient-to-b from-base-content/30 via-base-content/15 to-transparent"
    >
      {m.footer_brand_name_text()}
      {m.app_brand_name_text()}
    </div>
  </div>
</footer>
