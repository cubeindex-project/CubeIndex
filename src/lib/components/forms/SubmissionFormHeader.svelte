<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		title: string;
		description: string;
		actions?: Snippet;
	}

	let { title, description, actions }: Props = $props();
</script>

<header class="flex flex-col items-center gap-3 text-center">
	<h1 class="flex items-center gap-2 font-clash text-4xl font-semibold text-base-content">
		{title}
	</h1>
	<p class="max-w-2xl text-base-content/70">{description}</p>
</header>

{@render actions?.()}
