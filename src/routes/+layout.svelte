<script lang="ts">
	import "../app.css";
	import Navbar from "$lib/components/navbar.svelte";
	import Footer from "$lib/components/footer.svelte";
	import Disclaimer from "$lib/components/disclaimer.svelte";

	let { children } = $props();

	import { injectAnalytics } from "@vercel/analytics/sveltekit";
	import { injectSpeedInsights } from "@vercel/speed-insights";

	injectAnalytics();
	injectSpeedInsights();
</script>

<Disclaimer />

<Navbar />

{@render children()}

<Footer />
