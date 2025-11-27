import type { LayoutServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load = (async ({
  locals: { supabase, log, user },
  setHeaders,
  params,
}) => {
  const slug = params.slug;

  const { data: cube, error: cubeErr } = await supabase
    .from("v_detailed_cube_models")
    .select(
      "*,verified_by_id(display_name, username),submitted_by:submitted_by_id(display_name, username)"
    )
    .eq("slug", slug)
    .single();

  if (cubeErr) {
    log.error(
      { err: cubeErr },
      "An error occured while fetching the cube data"
    );
    throw error(500, "An error occured while fetching the cube data");
  }

  if (!cube) {
    throw error(404, "Cube not found");
  }

  const [sameSeriesRes, relatedRes, trimsRes] = await Promise.all([
    supabase
      .from("cube_models")
      .select("slug, series, model, version_name, image_url")
      .eq("series", cube.series)
      .eq("version_type", "Base")
      .neq("model", cube.model)
      .eq("status", "Approved")
      .order("model", { ascending: true })
      .limit(12),
    supabase
      .from("cube_models")
      .select("slug, series, model, version_name, image_url")
      .eq("slug", cube.related_to)
      .eq("status", "Approved")
      .maybeSingle(),
    supabase
      .from("cube_models")
      .select("slug, series, model, version_name, image_url")
      .eq("related_to", cube.slug)
      .eq("status", "Approved")
      .order("model", { ascending: true })
      .limit(24),
  ]);

  const { data: featuresListRaw, error: flErr } = await supabase
    .from("cube_features")
    .select("code");

  if (flErr) {
    log.error({ err: flErr }, "Failed to fetch the list of cube features");
    throw error(500, "Failed to fetch the list of cube features");
  }

  const features_list = featuresListRaw.map((f) => f.code);

  const features = Object.entries(cube)
    .filter(([key, value]) => features_list.includes(key) && value === true)
    .map(([key]) => key);

  let alreadyAdded = false;
  let userCubeDetail = null;

  if (user) {
    const { data: user_cube, error: ucErr } = await supabase
      .from("user_cubes")
      .select("*")
      .eq("user_id", user.id)
      .eq("cube", cube.slug)
      .maybeSingle();

    if (ucErr) {
      log.error({ err: ucErr }, "Failed to fetch user_cubes");
      throw error(500, "Failed to fetch user cubes");
    }

    alreadyAdded = user_cube !== null
    userCubeDetail = user_cube;
  }

  const isCubeSubmitter = user?.id === cube.submitted_by_id;

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  // Return only what your head/JSON-LD needs; keep/add your own fields as required.
  return {
    cube,
    features,
    alreadyAdded,
    isCubeSubmitter,
    userCubeDetail,
    sameSeries: sameSeriesRes.data ?? [],
    relatedCube: relatedRes.data ?? null,
    cubeTrims: trimsRes.data ?? [],
    verifiedBy: cube.verified_by_id,
    submittedBy: cube.submitted_by,
  };
}) satisfies LayoutServerLoad;
