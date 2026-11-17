import adapter from "@sveltejs/adapter-netlify";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig(() => {
  return {
    server: { fs: { allow: [".."] } },
    plugins: [
      devtoolsJson(),
      tailwindcss(),
      sveltekit({ preprocess: vitePreprocess(), adapter: adapter() }),
    ],
    test: {
      projects: [
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
