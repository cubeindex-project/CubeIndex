import type { PageLoad } from "./$types";

export const load = (() => ({
  meta: {
    title: "About Us - CubeIndex",
    description:
      "Meet CubeIndex, the open-source project helping speedcubers discover puzzles, track collections, and share their experience.",
  },
})) satisfies PageLoad;
