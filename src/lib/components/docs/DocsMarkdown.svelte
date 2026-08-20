<script lang="ts">
  import MarkdownIt from "markdown-it";
  import type Token from "markdown-it/lib/token.mjs";
  import { alert } from "@mdit/plugin-alert";
  import markdownItAnchor from "markdown-it-anchor";
  import { footnote } from "@mdit/plugin-footnote";
  import { fullEmoji } from "@mdit/plugin-emoji";

  import "@mdit/plugin-alert/style.css";

  interface Props {
    text: string;
  }

  interface TocItem {
    id: string;
    title: string;
    level: 2 | 3;
  }

  const { text }: Props = $props();

  function getHeadingText(tokens: Token[]): string {
    return tokens
      .filter(
        (token) =>
          token.type === "text" ||
          token.type === "code_inline" ||
          token.type === "emoji",
      )
      .map((token) => token.content)
      .join("")
      .trim();
  }

  const rendered = $derived.by(() => {
    const tableOfContents: TocItem[] = [];

    const md = MarkdownIt({
      html: false,
      linkify: true,
    })
      .use(alert)
      .use(markdownItAnchor, {
        level: [2, 3],

        permalink: markdownItAnchor.permalink.linkInsideHeader({
          symbol: "#",
          placement: "after",
          class: "header-anchor",
          ariaHidden: true,
        }),

        callback(token, info) {
          const level = Number(token.tag.slice(1));

          if (level !== 2 && level !== 3) {
            return;
          }

          const inlineToken = token.children?.find(
            (child) => child.type === "inline",
          );

          const title = inlineToken?.children
            ? getHeadingText(inlineToken.children)
            : info.title;

          tableOfContents.push({
            id: info.slug,
            title: title || info.slug,
            level,
          });
        },
      })
      .use(footnote)
      .use(fullEmoji);

    return {
      html: md.render(text),
      tableOfContents,
    };
  });

  const result = $derived(rendered.html);
  const tableOfContents = $derived(rendered.tableOfContents);
</script>

<article class="m-auto px-2 my-5 flex max-w-6xl">
  <div class="grid items-start gap-12 md:grid-cols-[minmax(0,1fr)_14rem]">
    <main
      class="markdown prose prose-zinc dark:prose-invert max-w-none min-w-0 [&_:is(h2,h3)]:scroll-mt-24 [&_.header-anchor]:ml-[0.4rem] [&_.header-anchor]:no-underline [&_.header-anchor]:opacity-0 [&_.header-anchor]:transition-opacity [&_.header-anchor]:duration-150 [&_:is(h2,h3):hover_.header-anchor]:opacity-100 [&_.header-anchor:focus-visible]:opacity-100"
    >
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html result}
    </main>

    {#if tableOfContents.length > 0}
      <aside
        class="sticky top-20 hidden max-h-full overflow-y-auto border-l border-l-base-content pl-4 md:block"
      >
        <nav aria-label="On this page">
          <p class="mb-3 text-sm font-semibold">On this page</p>

          <ul class="m-0 list-none p-0">
            {#each tableOfContents as item (item.id)}
              <li class="my-2" class:pl-4={item.level === 3}>
                <a
                  href={`#${item.id}`}
                  class="block text-sm leading-[1.4] text-inherit no-underline opacity-70 transition-[color,opacity] duration-150 hover:opacity-100 focus-visible:opacity-100"
                >
                  {item.title}
                </a>
              </li>
            {/each}
          </ul>
        </nav>
      </aside>
    {/if}
  </div>
</article>
