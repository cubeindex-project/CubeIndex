<script lang="ts">
	import "../app.css";
	import Navbar from "$lib/components/navbar.svelte";
	import Footer from "$lib/components/footer.svelte";
	import Disclaimer from "$lib/components/disclaimer.svelte";
	import { injectAnalytics } from "@vercel/analytics/sveltekit";
	import { injectSpeedInsights } from "@vercel/speed-insights";

	injectAnalytics();
	injectSpeedInsights();
	let { children } = $props();
</script>

<Disclaimer />

<Navbar />

{@render children()}

<Footer />
