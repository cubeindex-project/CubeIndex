<script lang="ts">
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { page } from "$app/state";

  // Minimal UI tokens to match home page styling
  const ui = {
    section: "relative overflow-hidden py-20 px-6",
    heroContainer:
      "px-6 relative flex min-h-[60vh] sm:min-h-[70vh] items-center justify-center text-center",
    h1: "text-5xl sm:text-7xl font-clash font-extrabold leading-[1.05] tracking-tight",
    lead: "text-lg sm:text-xl text-base-content/80",
    ctas: "flex flex-col sm:flex-row gap-4 justify-center",
  } as const;
</script>

<svelte:head>
  <title>API • CubeIndex</title>
  <meta name="description" content="CubeIndex public API is coming soon." />
</svelte:head>

<SsgoiTransition id={page.url.pathname}>
  <!-- HERO (mirrors home page look) -->
  <section class="{ui.section} bg-base-100">
    <div aria-hidden="true" class="absolute inset-0">
      <!-- Subtle top divider line -->
      <div
        class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-base-content/20 to-transparent"
      ></div>

      <!-- Soft background wash -->
      <div
        class="absolute inset-0 bg-gradient-to-b from-base-200/70 via-base-100 to-base-100"
      ></div>

      <!-- Radial glow (SaaS-style spotlight) -->
      <svg
        class="absolute inset-0 h-full w-full text-primary/90"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="hero-radial" cx="50%" cy="25%" r="75%">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.22" />
            <stop offset="60%" stop-color="currentColor" stop-opacity="0.12" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-radial)" />
      </svg>

      <!-- Subtle grid pattern with radial fade -->
      <svg
        class="absolute inset-0 h-full w-full text-base-content/80"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hero-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              stroke-opacity="0.08"
            />
          </pattern>
          <radialGradient id="hero-fade" cx="50%" cy="30%" r="80%">
            <stop offset="0%" stop-color="white" stop-opacity="1" />
            <stop offset="100%" stop-color="white" stop-opacity="0" />
          </radialGradient>
          <mask id="hero-grid-mask">
            <rect width="100%" height="100%" fill="url(#hero-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" mask="url(#hero-grid-mask)" />
      </svg>

      <!-- Accent blobs -->
      <div class="absolute left-1/2 -translate-x-1/2 h-[44rem] w-[44rem] rounded-full bg-primary/10 blur-3xl"></div>
      <div class="absolute -right-20 top-1/4 h-72 w-72 rounded-full bg-secondary/10 blur-3xl"></div>
      <div class="absolute -left-24 -bottom-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl"></div>
    </div>

    <div class={ui.heroContainer}>
      <div class="relative z-10 max-w-3xl space-y-6">
        <div class="inline-flex items-center gap-3 justify-center">
          <span class="badge badge-primary badge-lg">Developer Preview</span>
          <span class="badge badge-outline">v1 (planning)</span>
        </div>
        <h1 class={ui.h1}>Public API Coming Soon</h1>
        <p class={ui.lead}>
          A clean, privacy‑first JSON API for CubeIndex. Simple HTTP, sane
          limits, and great docs. Sign up below to follow progress.
        </p>
        <div class={ui.ctas}>
          <a href="/" class="btn btn-outline btn-lg sm:btn-xl">Back Home</a>
          <a href="/discord" class="btn btn-primary btn-lg sm:btn-xl">Join Our Discord</a>
        </div>
      </div>
    </div>
  </section>

  <!-- OVERVIEW / PLANS -->
  <section class="relative py-16 px-6">
    <div class="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Status -->
      <article class="card bg-base-100 border border-base-300/60 shadow-sm">
        <div class="card-body">
          <h2 class="card-title font-clash">Status</h2>
          <p>
            We’re drafting the v1 surface area and security model. Expect
            read‑only endpoints first, then authenticated write operations.
          </p>
          <ul class="mt-3 space-y-2 text-sm">
            <li class="flex items-center gap-2"><i class="fa-solid fa-check text-success"></i> JSON over HTTPS</li>
            <li class="flex items-center gap-2"><i class="fa-solid fa-check text-success"></i> Predictable pagination</li>
            <li class="flex items-center gap-2"><i class="fa-solid fa-check text-success"></i> Stable resource identifiers</li>
            <li class="flex items-center gap-2"><i class="fa-solid fa-wrench text-warning"></i> OAuth2 / PAT auth</li>
            <li class="flex items-center gap-2"><i class="fa-solid fa-wrench text-warning"></i> Webhooks (events)</li>
          </ul>
        </div>
      </article>

      <!-- Quick Example -->
      <article class="card bg-base-100 border border-base-300/60 shadow-sm lg:col-span-2">
        <div class="card-body">
          <h2 class="card-title font-clash">Quick Peek</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="text-xs uppercase tracking-wide text-base-content/60 mb-2">curl</div>
              <pre class="mockup-code text-sm">
<code>curl -s https://cubeindex.app/api/v1/cubes?limit=10</code>
<code></code>
<code># &#123;</code>
<code>#   &quot;data&quot;: [ &#123; &quot;id&quot;: &quot;c_123&quot;, &quot;name&quot;: &quot;GAN 12&quot; &#125;, ... ],</code>
<code>#   &quot;next&quot;: &quot;...cursor...&quot;</code>
<code># &#125;</code>
              </pre>
            </div>
            <div>
              <div class="text-xs uppercase tracking-wide text-base-content/60 mb-2">TypeScript (fetch)</div>
              <pre class="mockup-code text-sm">
<code>const res = await fetch(&quot;/api/v1/cubes?limit=10&quot;);</code>
<code>if (!res.ok) throw new Error(&quot;request failed&quot;);</code>
<code>type Cube = &#123; id: string; name: string &#125;</code>
<code>const body: &#123; data: Cube[]; next?: string &#125; = await res.json();</code>
              </pre>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>

  <!-- ENDPOINT SKETCH -->
  <section class="relative py-4 pb-16 px-6">
    <div class="mx-auto max-w-6xl">
      <h2 class="text-2xl sm:text-3xl font-clash font-extrabold tracking-tight mb-4">Planned Endpoints</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="border border-base-300/60 rounded-xl p-4 bg-base-100">
          <div class="flex items-center gap-2 mb-2"><span class="badge badge-success">GET</span><code class="font-mono text-sm">/api/v1/cubes</code></div>
          <p class="text-sm text-base-content/80">List cubes with pagination and filters.</p>
        </div>
        <div class="border border-base-300/60 rounded-xl p-4 bg-base-100">
          <div class="flex items-center gap-2 mb-2"><span class="badge badge-success">GET</span><code class="font-mono text-sm">/api/v1/cubes/&#123;id&#125;</code></div>
          <p class="text-sm text-base-content/80">Fetch a single cube by ID.</p>
        </div>
        <div class="border border-base-300/60 rounded-xl p-4 bg-base-100">
          <div class="flex items-center gap-2 mb-2"><span class="badge badge-neutral">GET</span><code class="font-mono text-sm">/api/v1/users/&#123;username&#125;</code></div>
          <p class="text-sm text-base-content/80">Public profile and basic stats.</p>
        </div>
        <div class="border border-base-300/60 rounded-xl p-4 bg-base-100">
          <div class="flex items-center gap-2 mb-2"><span class="badge badge-secondary">POST</span><code class="font-mono text-sm">/api/v1/collections</code></div>
          <p class="text-sm text-base-content/80">Create or update your collection (auth required).</p>
        </div>
        <div class="border border-base-300/60 rounded-xl p-4 bg-base-100">
          <div class="flex items-center gap-2 mb-2"><span class="badge">GET</span><code class="font-mono text-sm">/api/v1/search</code></div>
          <p class="text-sm text-base-content/80">Unified search across cubes, vendors, and users.</p>
        </div>
        <div class="border border-base-300/60 rounded-xl p-4 bg-base-100">
          <div class="flex items-center gap-2 mb-2"><span class="badge badge-accent">POST</span><code class="font-mono text-sm">/api/v1/webhooks/test</code></div>
          <p class="text-sm text-base-content/80">Send test event to your webhook receiver.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- AUTH / ERRORS -->
  <section class="relative py-4 pb-20 px-6">
    <div class="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Auth -->
      <article class="card bg-base-100 border border-base-300/60">
        <div class="card-body">
          <h3 class="card-title font-clash">Authentication</h3>
          <p class="mb-3">Personal Access Tokens first, OAuth 2.0 later.</p>
          <pre class="mockup-code text-sm">
<code># Add header</code>
<code>curl \</code>
<code>  -H &quot;Authorization: Bearer &lt;TOKEN&gt;&quot; \</code>
<code>  https://cubeindex.app/api/v1/cubes</code>
          </pre>
          <div class="text-xs text-base-content/60">Keep tokens secret; rotate regularly.</div>
        </div>
      </article>

      <!-- Errors -->
      <article class="card bg-base-100 border border-base-300/60">
        <div class="card-body">
          <h3 class="card-title font-clash">Errors & Shape</h3>
          <p class="mb-3">Consistent envelope with <span class="kbd kbd-sm">data</span> and <span class="kbd kbd-sm">error</span>.</p>
          <pre class="mockup-code text-sm">
<code>// 200 OK</code>
<code>&#123; &quot;data&quot;: [ ... ], &quot;next&quot;: null &#125;</code>
<code></code>
<code>// 4xx / 5xx</code>
<code>&#123; &quot;error&quot;: &#123; &quot;code&quot;: &quot;RATE_LIMIT&quot;, &quot;message&quot;: &quot;Slow down&quot; &#125; &#125;</code>
          </pre>
          <div class="text-xs text-base-content/60">Error codes are stable and documented.</div>
        </div>
      </article>
    </div>
  </section>

  <!-- STAY IN THE LOOP -->
  <section class="relative py-12 px-6 text-center">
    <div class="mx-auto max-w-3xl">
      <div class="inline-flex items-center gap-2 mb-3">
        <span class="badge badge-outline">Changelog</span>
        <span class="badge badge-outline">OpenAPI</span>
        <span class="badge badge-outline">SDKs</span>
      </div>
      <h3 class="text-2xl sm:text-3xl font-clash font-extrabold tracking-tight mb-3">Want early access?</h3>
      <p class="text-base-content/80 mb-6">We’ll announce alpha access, docs and SDKs in Discord. You can also watch the repository on GitHub when it lands.</p>
      <div class="flex items-center justify-center gap-3 flex-wrap">
        <a href="/discord" class="btn btn-primary">Join Discord</a>
        <a href="/about" class="btn btn-outline">Contact</a>
      </div>
    </div>
  </section>
</SsgoiTransition>
