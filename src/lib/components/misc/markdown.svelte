<script lang="ts">
  import Markdown from "svelte-exmarkdown";
  import "github-markdown-css/github-markdown.css";
  import DOMPurify from "isomorphic-dompurify";
  import { gfmPlugin } from "svelte-exmarkdown/gfm";

  const plugins = [gfmPlugin()];

  const { text }: { text: string } = $props();
</script>

<Markdown md={DOMPurify.sanitize(text)} {plugins} />
