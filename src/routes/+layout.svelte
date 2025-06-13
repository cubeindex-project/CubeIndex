<script lang="ts">
	import "../app.css";
	import Banner from "$lib/components/banner.svelte";
	import Navbar from "$lib/components/navbar.svelte";
	import Footer from "$lib/components/footer.svelte";
	import { injectAnalytics } from "@vercel/analytics/sveltekit";
	import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";

	injectAnalytics()
	injectSpeedInsights();
	let { children } = $props();
</script>
<Banner />
<Navbar />

{@render children()}

<Footer />
