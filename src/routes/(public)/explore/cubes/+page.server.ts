import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
  locals: { supabase, log },
  url,
  untrack,
}) => {
  const { data: cubes, error: err } = await supabase
    .from("v_detailed_cube_models")
    .select("*");

  if (err) {
    log.error({ err }, "Failed to load cubes");
    throw error(500, "Failed to load cubes");
  }

  const jsonLDItems = cubes
    .slice()
    .sort((a, b) => (a.owned_count ?? 0) - (b.owned_count ?? 0))
    .slice(0, 50)
    .map((cube, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: untrack(() => `${url.origin}/explore/cubes/${cube.slug}`),
      name: cube.name,
    }));

  return {
    cubes,
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
