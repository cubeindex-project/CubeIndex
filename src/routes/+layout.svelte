<script lang="ts">
	import "../app.css";
	import Navbar from "$lib/components/navbar.svelte";
	import Footer from "$lib/components/footer.svelte";
	import { injectAnalytics } from "@vercel/analytics/sveltekit";
	
	let { children } = $props();
</script>

<Navbar />

{@render children()}

<Footer />
