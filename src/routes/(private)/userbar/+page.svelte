<script lang="ts">
  import { page } from "$app/state";
  import Tag from "$lib/components/misc/tag.svelte";
  import { m } from "$lib/paraglide/messages";

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

  type SnippetKind = "markdown" | "html" | "bbcode" | "direct_url";

  const snippetLabel = (kind: SnippetKind) => {
    switch (kind) {
      case "markdown":
        return m.userbar_snippet_tab_markdown_label();
      case "html":
        return m.userbar_snippet_tab_html_label();
      case "bbcode":
        return m.userbar_snippet_tab_bbcode_label();
      case "direct_url":
        return m.userbar_snippet_tab_direct_url_label();
    }
  };

  // Embedding snippets
  const markdownAltText = m.userbar_snippet_userbar_alt_text({ displayName });
  const profileAltText = m.userbar_snippet_profile_alt_text({ displayName });
  const markdown = `[![${markdownAltText}](${directUrl})](${origin}/user/${username} "${profileAltText}")`;
  const html = `<a href="${origin}/user/${username}"><img src="${directUrl}" alt="${profileAltText}" width="350" height="19" /></a>`;
  const bbcode = `[url=${origin}/user/${username}][img]${directUrl}[/img][/url]`;

  let copied = $state<SnippetKind | null>(null);
  let active = $state<SnippetKind>("markdown");

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

  async function copy(text: string, label: SnippetKind) {
    try {
      await navigator.clipboard.writeText(text);
      copied = label;
      setTimeout(() => (copied = null), 1400);
    } catch {
      copied = null;
      alert(m.userbar_snippet_copy_error_text());
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
      <h1 class="text-3xl font-clash tracking-tight">
        {m.userbar_page_title_h1()}
      </h1>
      <Tag
        label={m.userbar_beta_tag_label()}
        gradient="from-indigo-500 via-purple-500 to-pink-500"
      />
    </div>
    <p class="text-sm opacity-80 mt-1">
      {m.userbar_intro_text()}
    </p>
  </header>

  <!-- Preview -->
  <section class="mb-8">
    <h2 class="text-sm font-medium mb-2">{m.userbar_preview_title()}</h2>

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
            previewLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          role="status"
          aria-live={previewError ? "assertive" : "polite"}
        >
          {#if previewError}
            <div
              class="pointer-events-auto flex h-full w-full flex-col items-center justify-center gap-2 rounded border border-error/40 bg-error/10 px-3 text-center text-xs text-error"
            >
              <span class="font-semibold">
                {m.userbar_preview_error_title_text()}
              </span>
              <button
                type="button"
                class="btn btn-xs btn-outline btn-error"
                onclick={refreshPreview}
              >
                {m.userbar_preview_retry_cta()}
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
              <span>{m.userbar_preview_loading_text()}</span>
            </div>
          {/if}
        </div>
        <a href={"/user/" + username} class="block" aria-busy={!previewLoaded}>
          <img
            src={previewUrl}
            alt={m.userbar_preview_image_alt_text({ displayName })}
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
        {m.userbar_preview_open_image_cta()}
      </a>
      <button
        class="btn btn-sm btn-outline"
        onclick={refreshPreview}
        type="button"
      >
        {m.userbar_preview_refresh_cta()}
      </button>
      <button class="btn btn-sm btn-primary" onclick={download}>
        {m.userbar_preview_download_cta()}
      </button>
      <span class="opacity-70">
        {m.userbar_preview_size_label()} <code>350 x 19 px</code>
      </span>
    </div>
  </section>

  <!-- Snippets -->
  <section>
    <h2 class="text-sm font-medium mb-2">{m.userbar_snippet_title()}</h2>
    <div class="tabs tabs-boxed mb-3">
      <button
        class={`tab ${active === "markdown" ? "tab-active" : ""}`}
        onclick={() => (active = "markdown")}
      >
        {m.userbar_snippet_tab_markdown_label()}
      </button>
      <button
        class={`tab ${active === "html" ? "tab-active" : ""}`}
        onclick={() => (active = "html")}
      >
        {m.userbar_snippet_tab_html_label()}
      </button>
      <button
        class={`tab ${active === "bbcode" ? "tab-active" : ""}`}
        onclick={() => (active = "bbcode")}
      >
        {m.userbar_snippet_tab_bbcode_label()}
      </button>
      <button
        class={`tab ${active === "direct_url" ? "tab-active" : ""}`}
        onclick={() => (active = "direct_url")}
      >
        {m.userbar_snippet_tab_direct_url_label()}
      </button>
    </div>

    {#if active === "markdown"}
      <div class="relative">
        <pre
          class="mockup-code whitespace-pre-wrap break-all text-xs rounded-md p-3 bg-base-200 text-base-content border border-base-300"><code
            >{markdown}</code
          ></pre>
        <button
          class={`btn btn-xs absolute top-2 right-2 ${copied === "markdown" ? "btn-success" : ""}`}
          onclick={() => copy(markdown, "markdown")}
          aria-label={m.userbar_snippet_copy_aria_text({
            snippet: snippetLabel("markdown"),
          })}
        >
          {m.userbar_snippet_copy_button_label({
            state: copied === "markdown" ? "copied" : "copy",
          })}
        </button>
      </div>
    {:else if active === "html"}
      <div class="relative">
        <pre
          class="mockup-code whitespace-pre-wrap break-all text-xs rounded-md p-3 bg-base-200 text-base-content border border-base-300"><code
            >{html}</code
          ></pre>
        <button
          class={`btn btn-xs absolute top-2 right-2 ${copied === "html" ? "btn-success" : ""}`}
          onclick={() => copy(html, "html")}
          aria-label={m.userbar_snippet_copy_aria_text({
            snippet: snippetLabel("html"),
          })}
        >
          {m.userbar_snippet_copy_button_label({
            state: copied === "html" ? "copied" : "copy",
          })}
        </button>
      </div>
    {:else if active === "bbcode"}
      <div class="relative">
        <pre
          class="mockup-code whitespace-pre-wrap break-all text-xs rounded-md p-3 bg-base-200 text-base-content border border-base-300"><code
            >{bbcode}</code
          ></pre>
        <button
          class={`btn btn-xs absolute top-2 right-2 ${copied === "bbcode" ? "btn-success" : ""}`}
          onclick={() => copy(bbcode, "bbcode")}
          aria-label={m.userbar_snippet_copy_aria_text({
            snippet: snippetLabel("bbcode"),
          })}
        >
          {m.userbar_snippet_copy_button_label({
            state: copied === "bbcode" ? "copied" : "copy",
          })}
        </button>
      </div>
    {:else}
      <div class="relative">
        <pre
          class="mockup-code whitespace-pre-wrap break-all text-xs rounded-md p-3 bg-base-200 text-base-content border border-base-300"><code
            >{directUrl}</code
          ></pre>
        <button
          class={`btn btn-xs absolute top-2 right-2 ${copied === "direct_url" ? "btn-success" : ""}`}
          onclick={() => copy(directUrl, "direct_url")}
          aria-label={m.userbar_snippet_copy_aria_text({
            snippet: snippetLabel("direct_url"),
          })}
        >
          {m.userbar_snippet_copy_button_label({
            state: copied === "direct_url" ? "copied" : "copy",
          })}
        </button>
      </div>
    {/if}
  </section>

  {#if copied}
    <div class="toast toast-end z-50">
      <div class="alert alert-success text-sm">
        <span>
          {m.userbar_snippet_copied_toast_text({
            snippet: snippetLabel(copied),
          })}
        </span>
      </div>
    </div>
  {/if}
</div>
