import type { DetailedCube } from "$lib/components/dbTableTypes";
import { formatDate } from "$lib/components/helper_functions/formatDate.svelte";
import type { LayoutServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

type DetailedCubeExtended = Omit<DetailedCube, "verified_by_id"> & {
  verified_by_id: { display_name: string; username: string } | null;
  submitted_by: { display_name: string; username: string };
};

export const load = (async ({
  locals: { supabase, log, user },
  setHeaders,
  params,
}) => {
  const slug = params.slug;

  const { data, error: cubeErr } = await supabase
    .from("v_detailed_cube_models")
    .select(
      "*,verified_by_id(display_name, username),submitted_by:submitted_by_id(display_name, username)",
    )
    .eq("slug", slug)
    .single();

  if (cubeErr) {
    log.error(
      { err: cubeErr },
      "An error occured while fetching the cube data",
    );
    throw error(500, "An error occured while fetching the cube data");
  }

  const cube: DetailedCubeExtended = data;

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

    alreadyAdded = user_cube !== null;
    userCubeDetail = user_cube;
  }

  const isCubeSubmitter = user?.id === cube.submitted_by_id;

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  const title = `${cube.name} - CubeIndex`
  const description =
    `The ${cube.name} is a ${cube.type} twisty puzzle` +
    (cube.release_date ? ` released on ${formatDate(cube.release_date)}` : "") +
    `. ` +
    (cube.low_price != null
      ? `Prices start at $${cube.low_price}. `
      : `Price data is not available yet. `) +
    (cube.rating_count > 0 && cube.rating != null
      ? `It holds an average rating of ${cube.rating}/5 from ${cube.rating_count} rating${cube.rating_count === 1 ? "" : "s"}.`
      : `It has no ratings yet, be the first to rate it on CubeIndex.`);
  const image = `/api/og/cube/${cube.slug}`

  return {
    cube,
    alreadyAdded,
    isCubeSubmitter,
    userCubeDetail,
    sameSeries: sameSeriesRes.data ?? [],
    relatedCube: relatedRes.data ?? null,
    cubeTrims: trimsRes.data ?? [],
    verifiedBy: cube.verified_by_id,
    submittedBy: cube.submitted_by,
    meta: {
      title,
      ogTitle: title,
      twitterTitle: title,
      description,
      ogDescription: description,
      twitterDescription: description,
      image,
      twitterImage: image, 
    },
  };
}) satisfies LayoutServerLoad;
