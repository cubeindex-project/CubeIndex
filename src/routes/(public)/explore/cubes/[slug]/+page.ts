import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import type { Cube } from "$lib/components/dbTableTypes.js";

export const load = (async ({ parent, data }) => {
  await parent();

  const cube = data.cube;

  const { data: cubes, error: cErr } = await supabase
    .from("cube_models")
    .select("*")
    .order("model", { ascending: true })
    .order("series", { ascending: true });

  if (cErr) {
    throw new Error("A 500 status code error occured:" + cErr.message);
  }

  const { data: features, error: featErr } = await supabase
    .from("cubes_model_features")
    .select("*")
    .eq("cube", cube.slug);

  if (featErr) {
    throw new Error("A 500 status code error occured:" + featErr.message);
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
    throw new Error(`Failed to fetch cube user counts: ${ucErr.message}`);
  }

  const { data: user_cube_ratings, error: urErr } = await supabase
    .from("user_cube_ratings")
    .select("*, profile:user_id(username, display_name)")
    .eq("cube_slug", cube.slug);

  if (urErr) {
    throw new Error(`Failed to fetch user ratings: ${urErr.message}`);
  }

  const { data: vendor_links, error: cvlErr } = await supabase
    .from("cube_vendor_links")
    .select("*")
    .eq("cube_slug", cube.slug);

  if (cvlErr) {
    throw new Error(
      `500, Failed to fetch vendor links for cube "${cube.slug}": ${cvlErr.message}`
    );
  }

  const { data: verifiedBy, error: verifiedErr } = await supabase
    .from("cube_models")
    .select("verified_by_id(display_name, username)")
    .eq("slug", cube.slug)
    .single();

  if (verifiedErr) {
    throw new Error(
      `500, Failed to fetch verified_by": ${verifiedErr.message}`
    );
  }

  const { data: submittedBy, error: submittedErr } = await supabase
    .from("cube_models")
    .select("submitted_by_id(display_name, username)")
    .eq("slug", cube.slug)
    .single();

  if (submittedErr) {
    throw new Error(
      `500, Failed to fetch verified_by": ${submittedErr.message}`
    );
  }

  return {
    ...data,
    cube,
    sameSeries,
    relatedCube,
    cubeTrims,
    user_cubes,
    user_cube_ratings,
    vendor_links,
    features,
    verifiedBy: verifiedBy.verified_by_id,
    submittedBy: submittedBy.submitted_by_id,
  };
}) satisfies PageLoad;
