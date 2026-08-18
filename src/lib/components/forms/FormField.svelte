<script lang="ts">
  import RequiredFieldMarker from "$lib/components/ui/RequiredFieldMarker.svelte";
  import type { Snippet } from "svelte";
  import FormHelpLink from "./FormHelpLink.svelte";

  interface Props {
    title: string;
    error?: string[];
    required?: boolean;
    helpHref?: string;
    hidden?: boolean;
    children: Snippet;
  }

  let {
    title,
    error,
    required = false,
    helpHref,
    hidden = false,
    children,
  }: Props = $props();
</script>

<label
  class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
  class:hidden
>
  <span>
    {title}
    {#if required}<RequiredFieldMarker />{/if}
    {#if helpHref}
      <FormHelpLink href={helpHref} {title} />
    {/if}
  </span>
  {@render children()}
  {#if error}
    <span class="text-xs text-error">{error}</span>
  {/if}
</label>
