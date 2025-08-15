import { configCatClient } from "$lib/configcatClient";
import type { PageLoad } from "./$types";

export const load = (async ({ setHeaders }) => {
  let databaseAvailability: boolean = true;
  let cubesAvailability: boolean = true;

  configCatClient.getValueAsync("database", false).then((value) => {
    databaseAvailability = value;
  });

  configCatClient.getValueAsync("cubes", false).then((value) => {
    cubesAvailability = value;
  });

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return { databaseAvailability, cubesAvailability };
}) satisfies PageLoad;
