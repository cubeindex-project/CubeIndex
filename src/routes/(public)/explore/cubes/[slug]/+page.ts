import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import type { Cube } from "$lib/components/types/cube";

export const load = (async ({ parent, params, data }) => {
  await parent();

  const slug = params.slug;

  const { data: cubes, error: cErr } = await supabase
    .from("cube_models")
    .select("*")
    .order("model", { ascending: true })
    .order("series", { ascending: true });

  if (cErr) {
    console.error("A 500 status code error occured:", cErr.message);
    return;
  }

  const cube: Cube = cubes.find((c) => c.slug === slug) ?? ({} as Cube);

  const { data: features, error: featErr } = await supabase
    .from("cubes_model_features")
    .select("*")
    .eq("cube", cube.slug);

  if (featErr) {
    console.error("A 500 status code error occured:", featErr.message);
    return;
  }

  const sameSeries: Cube[] = cubes.filter(
    (c) =>
      c.series === cube.series &&
      c.version_type === "Base" &&
      c.model !== cube.model &&
      c.status === "Approved"
  );

  const relatedCube: Cube | null =
    cubes.find((c) => c.slug === cube.related_to) ?? null;

  const cubeTrims: Cube[] = cubes.filter(
    (c) => c.related_to === cube.slug && c.status === "Approved"
  );

  const { data: user_cubes, error: ucErr } = await supabase
    .from("user_cubes")
    .select("*")
    .eq("cube", cube.slug);

  if (ucErr) {
    console.error(`Failed to fetch cube user counts: ${ucErr.message}`);
    return;
  }

  const { data: user_cube_ratings, error: urErr } = await supabase
    .from("user_cube_ratings")
    .select("*")
    .eq("cube_slug", cube.slug);

  if (urErr) {
    console.error(`Failed to fetch user ratings: ${urErr.message}`);
    return;
  }

  const { data: profiles, error: psErr } = await supabase
    .from("profiles")
    .select("id, username");

  if (psErr) {
    console.error(500, `Failed to fetch profiles: ${psErr.message}`);
    return;
  }

  const { data: vendor_links, error: cvlErr } = await supabase
    .from("cube_vendor_links")
    .select("*")
    .eq("cube_slug", cube.slug);

  if (cvlErr) {
    console.error(
      500,
      `Failed to fetch vendor links for cube "${cube.slug}": ${cvlErr.message}`
    );
    return;
  }

  return {
    ...data,
    cube,
    sameSeries,
    relatedCube,
    cubeTrims,
    user_cubes,
    user_cube_ratings,
    profiles,
    vendor_links,
    features,
  };
}) satisfies PageLoad;
