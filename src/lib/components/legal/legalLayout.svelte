<script lang="ts">
  import DOMPurify from "isomorphic-dompurify";

  /**
   * A content section in a legal document page.
   */
  type Section = { title: string; content: string };

  interface Props {
    title: string;
    lastUpdated: string;
    sections: Section[];
    historyURL: string;
  }

  /**
   * Props for the legal layout wrapper.
   * - title: The page title (e.g., Terms of Service, Privacy Policy)
   * - lastUpdated: Display date for the document's last update
   * - sections: Structured content blocks for the document
   * - historyURL: Optional URL to the document's source/history on GitHub
   */
  let { title, lastUpdated, sections, historyURL }: Props = $props();
</script>

<section class="min-h-screen px-6 py-24">
  <div class="max-w-4xl mx-auto">
    <article class="prose prose-zinc dark:prose-invert max-w-none">
      <h1 class="mb-2">{title}</h1>
      <p class="!mt-0 text-sm">
        Last updated: {lastUpdated}
        ·
        <a
          href={historyURL}
          target="_blank"
          rel="noopener external"
          class="link link-hover">View change history on GitHub</a
        >
      </p>

      {#each sections as section, i (i)}
        <h2>{i + 1}. {section.title}</h2>
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        <p>{@html DOMPurify.sanitize(section.content)}</p>
      {/each}
    </article>
  </div>
</section>
