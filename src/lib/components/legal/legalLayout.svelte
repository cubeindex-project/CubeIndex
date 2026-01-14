<script lang="ts">
  import { m } from "$lib/paraglide/messages";

  /**
   * A content section in a legal document page.
   */
  type Section = { title: string; content: string };

  /**
   * Props for the legal layout wrapper.
   * - title: The page title (e.g., Terms of Service, Privacy Policy)
   * - lastUpdated: Display date for the document's last update
   * - sections: Structured content blocks for the document
   * - historyURL: Optional URL to the document's source/history on GitHub
   */
  let { title, lastUpdated, sections, historyURL }: {
    title: string;
    lastUpdated: string;
    sections: Section[];
    historyURL?: string;
  } = $props();
</script>
<section class="min-h-screen px-6 py-24">
  <div class="max-w-4xl mx-auto">
    <article class="prose prose-zinc dark:prose-invert max-w-none">
      <h1 class="mb-2">{title}</h1>
      <p class="!mt-0 text-sm">
        {m.legal_layout_last_updated_text({ date: lastUpdated })}
        {#if historyURL}
          ·
          <a
            href={historyURL}
            target="_blank"
            rel="noopener"
            class="link link-hover"
            >{m.legal_layout_history_link_label()}</a
          >
        {/if}
      </p>

      {#each sections as section, i}
        <h2>{i + 1}. {section.title}</h2>
        <p>{@html section.content}</p>
      {/each}
    </article>
  </div>
</section>
