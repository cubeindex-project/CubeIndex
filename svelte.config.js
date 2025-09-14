import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		// Use absolute paths for build artifacts to avoid resolving under
		// the current route (e.g. "/auth/_app") when a non-root page is served
		// by the service worker or a static host
		paths: { relative: false }
	}
};

export default config;
