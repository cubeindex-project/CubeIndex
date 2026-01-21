import type { PageLoad } from "./$types";

export const load = (async () => {
  return { meta: { noindex: true } };
}) satisfies PageLoad;
