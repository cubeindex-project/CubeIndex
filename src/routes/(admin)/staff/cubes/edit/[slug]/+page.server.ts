import { type Actions, error, fail, redirect } from "@sveltejs/kit";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types.js";
import { logError } from "$lib/server/logError";
import { cubeFormSchema } from "$lib/schemas/cubeForm.js";
import { getPartialDate } from "$lib/utils/getPartialDate.js";
import { loadCubeFormOptions } from "$lib/server/cube/loadCubeFormOptions.js";
import { StatusError } from "$lib/errors/StatusError.js";
import { updateCube } from "$lib/server/staff/updateCube";

export const load: PageServerLoad = async ({
  params,
  locals: { supabase, log },
}) => {
  const { slug } = params;

  const { data: cube, error: cubeErr } = await supabase
    .from("v_detailed_cube_models")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (cubeErr) {
    return logError(500, "Unable to load cubes", log, cubeErr);
  }

  if (!cube) {
    return logError(
      500,
      "This cube doesn't exist",
      log,
      new Error("No cube was found"),
    );
  }

  const [
    { data: vendor_links, error: vlError },
    { data: cubeFeatures, error: cubeFeaturesErr },
  ] = await Promise.all([
    supabase.from("cube_vendor_links").select("*").eq("cube_id", cube.id),
    supabase.from("cubes_model_features").select("feature").eq("cube", slug),
  ]);

  if (vlError) {
    return logError(500, "Failed to load vendor links", log, vlError);
  }
  if (cubeFeaturesErr) {
    log.error(
      { err: cubeFeaturesErr.message },
      "Failed to fetch the current cube features",
    );
    throw error(500, "Failed to fetch the current cube features");
  }

  const formPromise = superValidate(
    {
      name: cube.name,
      seriesID: cube.series_id ? String(cube.series_id) : undefined,
      brandID: String(cube.brand_id),
      typeID: String(cube.type_id),
      subType: cube.sub_type ?? "auto",
      releaseDate: cube.release_date
        ? getPartialDate(cube.release_date, cube.release_date_precision)
        : undefined,
      imageUrl: cube.image_url,
      surfaceFinish: cube.surface_finish ?? undefined,
      weight: cube.weight,
      size: cube.size ?? undefined,
      versionType: cube.version_type,
      relatedToId: cube.related_to_id ?? undefined,
      discontinued: cube.discontinued,
      features: {
        wcaLegal: cubeFeatures.some((f) => f.feature === "wca_legal"),
        magnetic: cubeFeatures.some((f) => f.feature === "magnetic"),
        smart: cubeFeatures.some((f) => f.feature === "smart"),
        modded: cubeFeatures.some((f) => f.feature === "modded"),
        maglev: cubeFeatures.some((f) => f.feature === "maglev"),
        stickered: cubeFeatures.some((f) => f.feature === "stickered"),
        ballCore: cubeFeatures.some((f) => f.feature === "ball_core"),
      },
      vendorLinks: vendor_links,
    },
    zod4(cubeFormSchema),
    { errors: false },
  );

  let options: Awaited<ReturnType<typeof loadCubeFormOptions>>;
  try {
    options = await loadCubeFormOptions(supabase);
  } catch (cause) {
    log.error({ err: cause }, "Failed to load cube form options");
    throw error(500, "Failed to load cube form options");
  }

  return {
    form: await formPromise,
    formOptions: options,
  };
};

export const actions: Actions = {
  default: async ({ request, locals: { user, supabase, log }, params }) => {
    if (!user) {
      throw error(401, "Unauthorized");
    }

    const form = await superValidate(request, zod4(cubeFormSchema));
    if (!form.valid) {
      return message(form, "Please fix the highlighted fields and try again.", {
        status: 400,
      });
    }

    const currentSlug = params.slug;
    if (!currentSlug) {
      return fail(400, {
        form,
        message: "Missing cube slug",
      });
    }

    const { data: cube, error: cubeErr } = await supabase
      .from("cube_models")
      .select("id")
      .eq("slug", currentSlug)
      .maybeSingle();

    if (cubeErr) {
      log.error({ err: cubeErr }, "Failed to fetch cube");
      return setError(form, "Failed to fetch cube", { status: 500 });
    }

    if (!cube) {
      return setError(form, "Cube not found", { status: 400 });
    }

    try {
      await updateCube(form.data, supabase, log, cube.id);
    } catch (err) {
      if (err instanceof StatusError) {
        log.error({ err: err.cause }, err.message);
        return setError(form, err.message, { status: err.status });
      }
      throw err;
    }

    message(form, "Cube edited successfully!");
    // Temporary fix, it should redirect to the updated cube page
    throw redirect(303, "/staff/cubes");
  },
};
