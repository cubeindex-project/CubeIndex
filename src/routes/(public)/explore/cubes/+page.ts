import type { PageLoad } from "./$types";

export const load = (async ({ setHeaders }) => {
  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });
}) satisfies PageLoad;
