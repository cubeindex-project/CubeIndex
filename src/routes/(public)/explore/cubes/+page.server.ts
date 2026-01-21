import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";
import type { DetailedCube } from "$lib/components/dbTableTypes";

export const load: PageServerLoad = async ({
  locals: { supabase, log },
  setHeaders,
  url,
}) => {
  const { data, error: err } = await supabase
    .from("v_detailed_cube_models")
    .select("*")
    .eq("status", "Approved");

  if (err) {
    return logError(500, "Failed to load cubes", log, err);
  }

  const cubes: DetailedCube[] = data;

  // Cache aggressively on the edge, allow stale while revalidating
  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  const items = cubes
    .slice()
    .sort((a, b) => a.popularity - b.popularity)
    .slice(0, 50)
    .map((cube, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${url.origin}/explore/cubes/${cube.slug}`,
      name: cube.name,
    }));

  return {
    cubes,
    meta: {
      title: "Explore Cubes - CubeIndex",
      description:
        "Browse and compare speedcubes on CubeIndex. Filter by brand, size, and weight, check specs and pricing, and discover new cubes to add to your collection.",
      canonical: url.origin + url.pathname,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: items,
      },
    },
  };
};
