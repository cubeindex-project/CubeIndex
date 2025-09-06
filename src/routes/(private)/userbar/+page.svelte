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

  // Embedding snippets
  const markdown = `[![${displayName}&apos;s CubeIndex userbar](${directUrl})](${origin}/user/${username} "${username}&apos;s CubeIndex profile")`;
  const html = `<a href="${origin}/user/${username}"><img src="${directUrl}" alt="${displayName}'s CubeIndex profile" width="350" height="19" /></a>`;
  const bbcode = `[url=${origin}/user/${username}][img]${directUrl}[/img][/url]`;

  let copied = $state<null | string>(null);

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
    a.href = directUrl;
    a.download = `cubeindex-userbar-${username}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
  <header class="mb-6">
    <div class="flex items-center gap-3">
      <h1 class="text-2xl font-semibold">Your Userbar</h1>
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
      <a href="/user/{username}">
        <img
          src={directUrl}
          alt={`${displayName} — CubeIndex userbar`}
          width={350}
          height={19}
          class="block rounded"
          loading="eager"
          decoding="sync"
        />
      </a>
    </div>

    <div class="mt-3 flex items-center gap-3 text-sm">
      <a
        href={directUrl}
        target="_blank"
        rel="noopener"
        class="link link-primary break-all"
      >
        Open image
      </a>
      <button class="btn btn-xs btn-primary" onclick={download}>
        Download PNG
      </button>
      <span class="opacity-70">Size: <code>350×19</code></span>
    </div>
  </section>

  <!-- Snippets -->
  <section class="space-y-6">
    <div>
      <h2 class="text-sm font-medium mb-2">Markdown</h2>
      <div class="relative">
        <pre
          class="mockup-code whitespace-pre-wrap break-all text-xs rounded-md p-3 bg-base-200 border border-base-300"><code
            >{markdown}</code
          ></pre>
        <button
          class="btn btn-xs absolute top-2 right-2"
          onclick={() => copy(markdown, "Markdown")}
          aria-label="Copy Markdown"
        >
          Copy
        </button>
      </div>
    </div>

    <div>
      <h2 class="text-sm font-medium mb-2">HTML</h2>
      <div class="relative">
        <pre
          class="mockup-code whitespace-pre-wrap break-all text-xs rounded-md p-3 bg-base-200 border border-base-300"><code
            >{html}</code
          ></pre>
        <button
          class="btn btn-xs absolute top-2 right-2"
          onclick={() => copy(html, "HTML")}
          aria-label="Copy HTML"
        >
          Copy
        </button>
      </div>
    </div>

    <div>
      <h2 class="text-sm font-medium mb-2">BBCode</h2>
      <div class="relative">
        <pre
          class="mockup-code whitespace-pre-wrap break-all text-xs rounded-md p-3 bg-base-200 border border-base-300"><code
            >{bbcode}</code
          ></pre>
        <button
          class="btn btn-xs absolute top-2 right-2"
          onclick={() => copy(bbcode, "BBCode")}
          aria-label="Copy BBCode"
        >
          Copy
        </button>
      </div>
    </div>

    <div>
      <h2 class="text-sm font-medium mb-2">Direct URL</h2>
      <div class="relative">
        <pre
          class="mockup-code whitespace-pre-wrap break-all text-xs rounded-md p-3 bg-base-200 border border-base-300"><code
            >{directUrl}</code
          ></pre>
        <button
          class="btn btn-xs absolute top-2 right-2"
          onclick={() => copy(directUrl, "Direct URL")}
          aria-label="Copy Direct URL"
        >
          Copy
        </button>
      </div>
    </div>
  </section>

  {#if copied}
    <div class="toast toast-end z-50">
      <div class="alert alert-success text-sm">
        <span>Copied {copied}!</span>
      </div>
    </div>
  {/if}
</div>
