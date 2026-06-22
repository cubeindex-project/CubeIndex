import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";

export const load: PageServerLoad = async ({
  locals: { supabase, log, user },
  setHeaders,
  url,
  untrack,
}) => {
  const { data: cubes, error: err } = await supabase
    .from("v_detailed_cube_models")
    .select("*")
    .eq("status", "Approved");

  if (err) {
    return logError(500, "Failed to load cubes", log, err);
  }

  let userCubes;

  if (user) {
    const { data, error: ucErr } = await supabase
      .from("user_cubes")
      .select("*")
      .eq("user_id", user.id);

    if (ucErr) {
      return logError(500, "Failed to load user cubes cubes", log, err);
    }

    userCubes = data;
  }

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  const jsonLDItems = cubes
    .slice()
    .sort((a, b) => (a.popularity ?? 0) - (b.popularity ?? 0))
    .slice(0, 50)
    .map((cube, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: untrack(() => `${url.origin}/explore/cubes/${cube.slug}`),
      name: cube.name,
    }));

  return {
    cubes,
    userCubes,
    meta: {
      title: "Explore Cubes - CubeIndex",
      description:
        "Browse and compare speedcubes on CubeIndex. Filter by brand, size, and weight, check specs and pricing, and discover new cubes to add to your collection.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: jsonLDItems,
      },
    },
  };
};
