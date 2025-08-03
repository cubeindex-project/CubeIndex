<script lang="ts">
  import Page from "./(public)/+page.svelte";
  import { Ssgoi } from "@ssgoi/svelte";
  import { blur } from "@ssgoi/svelte/transitions";

  const config = { defaultTransition: blur(), transitions: [] };
</script>

<Ssgoi {config}>
  <Page />
</Ssgoi>
