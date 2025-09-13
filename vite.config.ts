import tailwindcss from "@tailwindcss/vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, loadEnv } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const SUPABASE_URL = env.PUBLIC_SUPABASE_URL || "";
  let supabaseHostPattern = "[a-z0-9-]+\\.supabase\\.co";
  try {
    if (SUPABASE_URL) {
      const host = new URL(SUPABASE_URL).host;
      supabaseHostPattern = host.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  } catch {
    // fallback to generic supabase host pattern
  }

  return {
    server: {
      fs: {
        allow: [".."],
      },
    },
    plugins: [
      devtoolsJson(),
      tailwindcss(),
      sveltekit(),
      SvelteKitPWA({
        registerType: "prompt",
        injectRegister: "auto",
        devOptions: {
          enabled: true,
        },
        workbox: {
          navigateFallback: "/offline",
          runtimeCaching: [
            // Cache GET queries to Supabase REST API (public data only)
            {
              urlPattern: new RegExp(`https?:\\/\\/${supabaseHostPattern}\\/rest\\/v1\\/.*`),
              handler: "NetworkFirst",
              method: "GET",
              options: {
                cacheName: "supabase-rest",
                networkTimeoutSeconds: 8,
                cacheableResponse: { statuses: [0, 200] },
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 10 }, // 10 minutes
              },
            },
            // Never cache auth requests
            {
              urlPattern: new RegExp(`https?:\\/\\/${supabaseHostPattern}\\/auth\\/v1\\/.*`),
              handler: "NetworkOnly",
            },
            // Cache public storage objects (images, files)
            {
              urlPattern: new RegExp(
                `https?:\\/\\/${supabaseHostPattern}\\/storage\\/v1\\/object\\/public\\/.*`
              ),
              handler: "CacheFirst",
              method: "GET",
              options: {
                cacheName: "supabase-storage-public",
                cacheableResponse: { statuses: [0, 200] },
                expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 14 }, // 14 days
              },
            },
          ],
        },
        manifest: {
          name: "CubeIndex",
          short_name: "CubeIndex",
          description: "Track and explore speedcubes",
          theme_color: "#044eb4",
          background_color: "#FFFFFF",
        orientation: "any",
        id: "/",
        start_url: "/",
        display_override: ["window-controls-overlay"],
        display: "standalone",
        icons: [
          {
            src: "images/icons/manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "images/icons/manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "images/icons/manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "images/icons/manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/CI-desktop-home.webp",
            sizes: "1920x1080",
            type: "image/webp",
            form_factor: "wide",
            label: "Home screen showing catchline",
          },
          {
            src: "/CI-mobile-home.webp",
            sizes: "1440x3040",
            type: "image/webp",
            platform: "android",
            label: "Home screen showing catchline",
          },
          {
            src: "/CI-desktop-cubes.webp",
            sizes: "1920x1080",
            type: "image/webp",
            form_factor: "wide",
            label: "Page to explore the cubes database",
          },
          {
            src: "/CI-mobile-cubes.webp",
            sizes: "1440x3040",
            type: "image/webp",
            platform: "android",
            label: "Page to explore the cubes database",
          },
        ],
        },
      }),
    ],
    test: {
      workspace: [
        {
          extends: "./vite.config.ts",
          plugins: [svelteTesting()],
          define: {
            __ENABLE_CARTA_SSR_HIGHLIGHTER__: false,
          },
          test: {
            name: "client",
            environment: "jsdom",
            clearMocks: true,
            include: ["src/**/*.svelte.{test,spec}.{js,ts}"],
            exclude: ["src/lib/server/**"],
            setupFiles: ["./vitest-setup-client.ts"],
          },
        },
        {
          extends: "./vite.config.ts",
          test: {
            name: "server",
            environment: "node",
            include: ["src/**/*.{test,spec}.{js,ts}"],
            exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"],
          },
        },
      ],
    },
  };
});
