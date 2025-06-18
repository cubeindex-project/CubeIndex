import { supabase } from "$lib/supabaseClient";
import { error, type Actions, fail } from "@sveltejs/kit";
import { configCatClient } from "$lib/configcatClient";

export const load = async ({ params }) => {
  const { slug } = params;

  let databaseAvailability: boolean = true;
  let cubesAvailability: boolean = true;

  configCatClient.getValueAsync("database", false).then((value) => {
    databaseAvailability = value;
  });

  configCatClient.getValueAsync("cubes", false).then((value) => {
    cubesAvailability = value;
  });

  if (databaseAvailability || cubesAvailability) {
    const { data: cube, error: cubeError } = await supabase
      .from("cube_models")
      .select("*")
      .eq("slug", slug)
      .single();

    if (cubeError)
      throw error(
        500,
        `Failed to fetch cube with slug "${slug}": ${cubeError.message}`
      );

    let relatedCube = null;
    if (cube.version_type !== "Base" || cube.modded === true) {
      const { data, error: relatedError } = await supabase
        .from("cube_models")
        .select("*")
        .eq("slug", cube.related_to)
        .single();

      if (relatedError)
        throw error(
          500,
          `Failed to fetch related cube with slug "${cube.related_to}": ${relatedError.message}`
        );
      relatedCube = data;
    }

    const { data: sameSeries, error: seriesError } = await supabase
      .from("cube_models")
      .select("*")
      .match({
        series: cube.series,
        version_type: "Base",
      })
      .neq("model", cube.model);

    if (seriesError)
      throw error(
        500,
        `Failed to fetch cube with slug "${slug}": ${seriesError.message}`
      );

    const { data: cubeTrims, error: trimsErr } = await supabase
      .from("cube_models")
      .select("*")
      .eq("related_to", slug);

    if (trimsErr)
      throw error(
        500,
        `Failed to fetch cube trims related to slug "${slug}": ${trimsErr.message}`
      );

    const { data: vendor_links, error: vendorError } = await supabase
      .from("cube_vendor_links")
      .select("*")
      .eq("cube_slug", cube.slug);

    if (vendorError)
      throw error(
        500,
        `Failed to fetch vendor links for cube "${cube.slug}": ${vendorError.message}`
      );

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username");

    if (profilesError)
      throw error(500, `Failed to fetch profiles: ${profilesError.message}`);

    const { data: user_ratings, error: ratingsError } = await supabase
      .from("user_ratings")
      .select("*")
      .eq("cube_slug", cube.slug);

    if (ratingsError)
      throw error(500, `Failed to fetch profiles: ${ratingsError.message}`);

    const { data: cubeUserCount, error: userCubesErr } = await supabase
      .from("user_cubes")
      .select("*")
      .eq("cube", cube.slug);

    if (userCubesErr)
      throw error(500, `Failed to fetch profiles: ${userCubesErr.message}`);

    return {
      cube,
      cubeTrims,
      relatedCube,
      sameSeries,
      vendor_links,
      profiles,
      user_ratings,
      databaseAvailability,
      cubesAvailability,
      cubeUserCount,
    };
  }

  return { databaseAvailability, cubesAvailability };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const username = form.get("username") as string;
    const slug = form.get("slug") as string;
    const quantity = form.get("quantity");
    const main = form.get("main") || false;
    const condition = form.get("condition") as string;
    const status = form.get("status") as string;
    const notes = form.get("notes") as string;
    const acquired_at = form.get("acquiredAt") || null;
    const formattedAcquiredAt = acquired_at
      ? (() => {
          const date = new Date(acquired_at.toString());
          const mm = (date.getMonth() + 1).toString().padStart(2, "0");
          const dd = date.getDate().toString().padStart(2, "0");
          const yyyy = date.getFullYear();
          return `${mm}-${dd}-${yyyy}`;
        })()
      : acquired_at;

    const payload = [
      {
        username,
        cube: slug,
        quantity,
        main,
        condition,
        status,
        notes,
        acquired_at: formattedAcquiredAt,
      },
    ];

    const { error: userCubesErr } = await locals.supabase
      .from("user_cubes")
      .insert(payload)
      .select();

    if (
      userCubesErr?.message ===
      'duplicate key value violates unique constraint "user_cubes_pkey"'
    )
      return fail(400, {
        message: "You have already added this cube to your profile!",
      });
    if (userCubesErr) return fail(500, { message: userCubesErr.message });

    return { message: "Cube added successfully!" };
  },
};
