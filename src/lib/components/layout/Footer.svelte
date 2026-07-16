<script lang="ts">
  import { resolve } from "$app/paths";

  const currentYear = new Date().getFullYear();
</script>

<footer class="border-t border-base-300">
  <div class="mx-auto max-w-7xl px-6 py-12 lg:px-8">
    <div class="footer footer-horizontal">
      <div class="max-w-md">
        <a class="inline-flex items-center gap-3" href={resolve("/")}>
          <img
            class="size-12 rounded-xl"
            src="/images/CubeIndex_Logo.webp"
            alt=""
          />
          <span class="font-clash text-2xl font-semibold">CubeIndex</span>
        </a>
        <p class="mt-5 text-sm leading-6 text-base-content/70">
          Track, explore, and share your speedcube collection with a community
          built by cubers, for cubers.
        </p>
        <div class="mt-6 flex gap-2">
          <a
            class="btn btn-ghost btn-circle btn-sm"
            href="https://github.com/cubeindex-project/CubeIndex"
            aria-label="CubeIndex on GitHub"
          >
            <i class="fa-brands fa-github text-lg"></i>
          </a>
          <a
            class="btn btn-ghost btn-circle btn-sm"
            href="https://twitter.com/thecubeindex"
            aria-label="CubeIndex on Twitter"
          >
            <i class="fa-brands fa-twitter text-lg"></i>
          </a>
          <a
            class="btn btn-ghost btn-circle btn-sm"
            href="https://www.youtube.com/@cubeindex"
            aria-label="CubeIndex on YouTube"
          >
            <i class="fa-brands fa-youtube text-lg"></i>
          </a>
          <a
            class="btn btn-ghost btn-circle btn-sm"
            href={resolve("/(public)/discord")}
            aria-label="Join CubeIndex on Discord"
          >
            <i class="fa-brands fa-discord text-lg"></i>
          </a>
        </div>
      </div>

      <nav>
        <h2 class="footer-title">Website</h2>
        <a class="link link-hover" href={resolve("/(public)/about")}>
          About us
        </a>
        <a class="link link-hover" href={resolve("/(public)/apply")}>
          Apply for staff
        </a>
        <a class="link link-hover" href={resolve("/(public)/report")}>
          Feedback & reports
        </a>
        <a
          class="link link-hover"
          href="https://github.com/orgs/cubeindex-project/projects/1"
        >
          Roadmap
        </a>
        <a class="link link-hover" href="mailto:contact@thecubeindex.com">
          Contact us
        </a>
      </nav>

      <nav>
        <h2 class="footer-title">Legal</h2>
        <a class="link link-hover" href={resolve("/(public)/tos")}>
          Terms of service
        </a>
        <a class="link link-hover" href={resolve("/(public)/privacy")}>
          Privacy policy
        </a>
        <a class="link link-hover" href="/sitemap.xml" rel="external">
          Sitemap
        </a>
      </nav>
    </div>

    <div
      class="footer footer-horizontal mt-12 items-center justify-between gap-2 border-t border-base-300 pt-6 text-base-content/60"
    >
      <p>&copy; 2025&ndash;{currentYear} CubeIndex Project</p>
      <p>Released under the Apache 2.0 license</p>
    </div>
  </div>
</footer>
