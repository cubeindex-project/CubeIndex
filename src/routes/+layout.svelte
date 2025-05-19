<script lang="ts">
	// Components and style
	import "../app.css";
	import Navbar from "$lib/components/navbar.svelte";
    import Footer from "$lib/components/footer.svelte";
    import Disclaimer from "$lib/components/disclaimer.svelte";
	import { Toaster } from "svelte-sonner";

	let { data, children } = $props();

	// Vercel's Analytics and Speed Insights
	import { injectAnalytics } from "@vercel/analytics/sveltekit";
	import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";

	injectAnalytics();
	injectSpeedInsights();

	// Keeping user fresh in the browser
	import { invalidate } from "$app/navigation";
	import { onMount } from "svelte";

	let { session, supabase } = $derived(data);
	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate("supabase:auth");
			}
		});
		return () => data.subscription.unsubscribe();
	});
</script>

<Disclaimer />

<Navbar session={data.session} />

<Toaster />

{@render children()}

<Footer />
