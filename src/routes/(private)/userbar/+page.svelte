<script lang="ts">
  import { page } from "$app/state";
  import Tag from "$lib/components/misc/tag.svelte";

  // Svelte 5 runes flavor
  const { data } = $props<{
    data: { username: string; display_name: string };
  }>();

  const username = data.username;
  const displayName = data.display_name;

  // Use a relative URL so SSR doesn't need window.origin
  const origin = page.url.origin;
  const directUrl = `${origin}/api/og/userbar/${encodeURIComponent(username)}`;
  let cacheBust = $state(0);
  let bustSeed = 0;
  const previewUrl = $derived(
    cacheBust ? `${directUrl}?v=${cacheBust}` : directUrl,
  );
  let previewLoaded = $state(false);
  let previewError = $state(false);

  // Embedding snippets
  const markdown = `[![${displayName}&apos;s CubeIndex userbar](${directUrl})](${origin}/user/${username} "${displayName}&apos;s CubeIndex profile")`;
  const html = `<a href="${origin}/user/${username}"><img src="${directUrl}" alt="${displayName}'s CubeIndex profile" width="350" height="19" /></a>`;
  const bbcode = `[url=${origin}/user/${username}][img]${directUrl}[/img][/url]`;

  let copied = $state<null | string>(null);
  let active = $state<"Markdown" | "HTML" | "BBCode" | "Direct URL">("Markdown");

  function handleLoad() {
    previewLoaded = true;
    previewError = false;
  }

  function handleError() {
    previewLoaded = false;
    previewError = true;
  }

  function refreshPreview() {
    previewLoaded = false;
    previewError = false;
    bustSeed += 1;
    cacheBust = Date.now() + bustSeed;
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      copied = label;
      setTimeout(() => (copied = null), 1400);
    } catch {
      copied = null;
      alert("Copy failed — you can select and copy manually.");
    }
  }

  function download() {
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `cubeindex-userbar-${username}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
</script>

<svelte:head>
  <link rel="preload" as="image" href={previewUrl} />
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8 min-h-screen">
  <header class="mb-6">
    <div class="flex items-center gap-3">
      <h1 class="text-3xl font-clash tracking-tight">Userbar</h1>
      <Tag label="Beta" gradient="from-indigo-500 via-purple-500 to-pink-500" />
    </div>
    <p class="text-sm opacity-80 mt-1">
      Share this slim banner in forums, profiles, and signatures. It updates
      automatically as your stats change.
    </p>
  </header>

  <!-- Preview -->
  <section class="mb-8">
    <h2 class="text-sm font-medium mb-2">Preview</h2>

    <!-- Subtle checker helps on light/dark themes -->
    <div
      class="rounded-md border border-base-300 p-3 bg-base-100"
      style="
        background-image:
          linear-gradient(45deg,hsl(var(--b2)) 25%,transparent 25%),
          linear-gradient(-45deg,hsl(var(--b2)) 25%,transparent 25%),
          linear-gradient(45deg,transparent 75%,hsl(var(--b2)) 75%),
          linear-gradient(-45deg,transparent 75%,hsl(var(--b2)) 75%);
        background-size: 12px 12px;
        background-position: 0 0, 0 6px, 6px -6px, -6px 0px;
      "
    >
      <div class="relative inline-flex overflow-hidden rounded">
        <div
          class={`absolute inset-0 rounded transition-opacity duration-200 ${
            previewLoaded
              ? "opacity-0 pointer-events-none"
              : "opacity-100"
          }`}
          role="status"
          aria-live={previewError ? "assertive" : "polite"}
        >
          {#if previewError}
            <div
              class="pointer-events-auto flex h-full w-full flex-col items-center justify-center gap-2 rounded border border-error/40 bg-error/10 px-3 text-center text-xs text-error"
            >
              <span class="font-semibold">Preview failed</span>
              <button
                type="button"
                class="btn btn-xs btn-outline btn-error"
                onclick={refreshPreview}
              >
                Try again
              </button>
            </div>
          {:else}
            <div
              class="pointer-events-none flex h-full w-full items-center justify-center gap-2 rounded border border-base-300/70 bg-base-200/70 px-3 text-xs text-base-content/70 motion-safe:animate-pulse"
            >
              <span
                class="loading loading-dots loading-xs text-primary"
                aria-hidden="true"
              ></span>
              <span>Generating preview…</span>
            </div>
          {/if}
        </div>
        <a href={'/user/' + username} class="block" aria-busy={!previewLoaded}>
          <img
            src={previewUrl}
            alt={`${displayName} - CubeIndex userbar`}
            width={350}
            height={19}
            class={`block rounded transition-opacity duration-200 ${
              previewLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="eager"
            decoding="async"
            fetchpriority="high"
            onload={handleLoad}
            onerror={handleError}
          />
        </a>
      </div>
    </div>

    <div class="mt-3 flex items-center gap-3 text-sm">
      <a
        href={previewUrl}
        target="_blank"
        rel="noopener"
        class="link link-primary break-all"
      >
        Open image
      </a>
      <button
        class="btn btn-sm btn-outline"
        onclick={refreshPreview}
        type="button"
      >
        Refresh preview
      </button>
      <button class="btn btn-sm btn-primary" onclick={download}>
        Download PNG
      </button>
      <span class="opacity-70">Size: <code>350 x 19 px</code></span>
    </div>
  </section>

  <!-- Snippets -->
  <section>
    <h2 class="text-sm font-medium mb-2">Embed Snippets</h2>
    <div class="tabs tabs-boxed mb-3">
      <button class={`tab ${active === 'Markdown' ? 'tab-active' : ''}`} onclick={() => (active = 'Markdown')}>Markdown</button>
      <button class={`tab ${active === 'HTML' ? 'tab-active' : ''}`} onclick={() => (active = 'HTML')}>HTML</button>
      <button class={`tab ${active === 'BBCode' ? 'tab-active' : ''}`} onclick={() => (active = 'BBCode')}>BBCode</button>
      <button class={`tab ${active === 'Direct URL' ? 'tab-active' : ''}`} onclick={() => (active = 'Direct URL')}>Direct URL</button>
    </div>

    {#if active === 'Markdown'}
      <div class="relative">
        <pre class="mockup-code whitespace-pre-wrap break-all text-xs rounded-md p-3 bg-base-200 border border-base-300"><code>{markdown}</code></pre>
        <button
          class={`btn btn-xs absolute top-2 right-2 ${copied === 'Markdown' ? 'btn-success' : ''}`}
          onclick={() => copy(markdown, 'Markdown')}
          aria-label="Copy Markdown"
        >
          {copied === 'Markdown' ? 'Copied' : 'Copy'}
        </button>
      </div>
    {:else if active === 'HTML'}
      <div class="relative">
        <pre class="mockup-code whitespace-pre-wrap break-all text-xs rounded-md p-3 bg-base-200 border border-base-300"><code>{html}</code></pre>
        <button
          class={`btn btn-xs absolute top-2 right-2 ${copied === 'HTML' ? 'btn-success' : ''}`}
          onclick={() => copy(html, 'HTML')}
          aria-label="Copy HTML"
        >
          {copied === 'HTML' ? 'Copied' : 'Copy'}
        </button>
      </div>
    {:else if active === 'BBCode'}
      <div class="relative">
        <pre class="mockup-code whitespace-pre-wrap break-all text-xs rounded-md p-3 bg-base-200 border border-base-300"><code>{bbcode}</code></pre>
        <button
          class={`btn btn-xs absolute top-2 right-2 ${copied === 'BBCode' ? 'btn-success' : ''}`}
          onclick={() => copy(bbcode, 'BBCode')}
          aria-label="Copy BBCode"
        >
          {copied === 'BBCode' ? 'Copied' : 'Copy'}
        </button>
      </div>
    {:else}
      <div class="relative">
        <pre class="mockup-code whitespace-pre-wrap break-all text-xs rounded-md p-3 bg-base-200 border border-base-300"><code>{directUrl}</code></pre>
        <button
          class={`btn btn-xs absolute top-2 right-2 ${copied === 'Direct URL' ? 'btn-success' : ''}`}
          onclick={() => copy(directUrl, 'Direct URL')}
          aria-label="Copy Direct URL"
        >
          {copied === 'Direct URL' ? 'Copied' : 'Copy'}
        </button>
      </div>
    {/if}
  </section>

  {#if copied}
    <div class="toast toast-end z-50">
      <div class="alert alert-success text-sm">
        <span>Copied {copied}!</span>
      </div>
    </div>
  {/if}
</div>
