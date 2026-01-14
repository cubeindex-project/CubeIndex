import type { PageLoad } from "./$types";

export const load = (async () => {
  return { meta: { title: "Reset Password - CubeIndex", noindex: true } };
}) satisfies PageLoad;
