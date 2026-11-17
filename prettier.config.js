/** @type {import('prettier').Config} */
const config = {
  plugins: ["prettier-plugin-svelte"],
  htmlWhitespaceSensitivity: "ignore",
  overrides: [
    {
      files: "*.svelte",
      options: { parser: "svelte" },
    },
  ],
};

export default config;
