import { type Actions, error, fail, redirect } from "@sveltejs/kit";
import { slugify } from "$lib/components/helper_functions/slugify.svelte.js";
import { getSubTypes } from "$lib/components/helper_functions/subType.svelte.js";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types.js";
import { cleanLink } from "$lib/components/helper_functions/linkCleaner.js";
import { logError } from "$lib/server/logError";
import type { Tables, TablesUpdate } from "$lib/types/database.types.js";
import { cubeFormSchema, normalizeReleaseDate } from "$lib/schemas/cubeForm.js";
import { getPartialDate } from "$lib/utils/getPartialDate.js";
import { loadCubeFormOptions } from "$lib/server/cube/loadCubeFormOptions.js";

export const load: PageServerLoad = async ({
  params,
  locals: { supabase, log },
}) => {
  const { slug } = params;

  const { data: cube, error: cubeErr } = await supabase
    .from("v_detailed_cube_models")
    .select("*")
    .eq("slug", slug)
    .neq("status", "Rejected")
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
    supabase.from("cube_vendor_links").select("*").eq("cube_slug", slug),
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

  const [form, options] = await Promise.all([
    superValidate(
      {
        name: cube.name,
        seriesId: cube.series_id ?? undefined,
        brand: cube.brand,
        type: cube.type,
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
    ),
    loadCubeFormOptions(supabase, log),
  ]);

  return {
    cube,
    form,
    formOptions: options,
  };
};

export const actions: Actions = {
  default: async ({ request, locals, params }) => {
    const form = await superValidate(request, zod4(cubeFormSchema));
    if (!form.valid) {
      return message(form, "Please fix the highlighted fields and try again.", {
        status: 400,
      });
    }

    if (!locals.user) {
      return fail(401, {
        form,
        message: "User is not logged-in",
      });
    }

    const data = form.data;
    const currentSlug = params.slug;

    if (!currentSlug) {
      return fail(400, {
        form,
        message: "Missing cube slug",
      });
    }

    if (!form.valid)
      return fail(400, {
        form,
        message:
          "There are errors in your submission. Please review the highlighted fields and try again.",
      });

    const slug = slugify(data.name);

    if (data.type === "___other") {
      const { error: err } = await locals.supabase
        .from("cube_types")
        .insert([{ name: data.otherType, added_by_id: locals.user?.id }]);

      if (err) {
        return logError(500, "Failed to add new cube type", locals.log, err);
      }
    }
    if (data.brand === "___other") {
      const { error: brandErr } = await locals.supabase
        .from("brands")
        .insert([{ name: data.otherBrand, added_by_id: locals.user.id }]);

      if (brandErr) {
        return logError(500, "Failed to add new brand", locals.log, brandErr);
      }
    }

    let seriesID = data.seriesId;
    if (data.otherSeries) {
      const { data: series, error: seriesErr } = await locals.supabase
        .from("cube_series")
        .insert({ name: data.otherSeries })
        .select("id")
        .single();

      if (seriesErr) {
        locals.log.error(
          { err: seriesErr.message },
          "Failed to add new cube series",
        );
        return setError(
          form,
          "otherSeries",
          seriesErr.code === "23505"
            ? "This series already exists"
            : "An error occurred while adding the new series",
          { status: seriesErr.code === "23505" ? 400 : 500 },
        );
      }

      seriesID = series.id;
    }

    const subType =
      data.subType === "auto"
        ? getSubTypes(
            (data.type !== "___other" ? data.type?.trim() : data.otherType) ??
              null,
          )
        : data.subType;

    const releaseDate = data.releaseDate
      ? normalizeReleaseDate(data.releaseDate)
      : null;

    const cubePayload: TablesUpdate<"cube_models"> = {
      slug,
      name: data.name.trim(),
      series_id: seriesID,
      brand: data.brand !== "___other" ? data.brand?.trim() : data.otherBrand,
      type: data.type !== "___other" ? data.type?.trim() : data.otherType,
      sub_type: subType,
      release_date: releaseDate?.date,
      release_date_precision: releaseDate?.precision,
      image_url: cleanLink(data.imageUrl),
      surface_finish:
        data.surfaceFinish?.trim() as Tables<"cube_models">["surface_finish"],
      weight: data.weight,
      size: data.size,
      version_type: data.versionType,
      related_to_id: data.relatedToId,
      discontinued: data.discontinued,
      updated_at: new Date().toISOString(),
    };

    const vendorPayload = data.vendorLinks.map((vendorLink) => ({
      cube_slug: slug,
      vendor_name: vendorLink.vendor_name,
      url: cleanLink(vendorLink.url)?.trim(),
      available: vendorLink.available,
      price: vendorLink.price,
    }));

    const { error: updateErr } = await locals.supabase
      .from("cube_models")
      .update(cubePayload)
      .eq("slug", currentSlug);

    if (updateErr) {
      return logError(
        500,
        "Failed to update cube information",
        locals.log,
        updateErr,
      );
    }

    const { error: upsertVenErr } = await locals.supabase
      .from("cube_vendor_links")
      .upsert(vendorPayload);

    if (
      upsertVenErr?.message ===
      'new row violates row-level security policy for table "cube_vendor_links"'
    ) {
      return logError(
        401,
        "You do not have permission to update vendor links for this cube.",
        locals.log,
        upsertVenErr,
      );
    }
    if (upsertVenErr) {
      return logError(
        500,
        "Failed to update vendor links",
        locals.log,
        upsertVenErr,
      );
    }

    const features = data.features;

    // Map camelCase → snake_case or to your exact codes if needed
    const normalizeKey = (key: string) =>
      key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);

    const { data: existingRows, error: rowsErr } = await locals.supabase
      .from("cubes_model_features")
      .select("*")
      .eq("cube", slug);

    if (rowsErr) {
      return logError(
        500,
        "Failed to load existing cube features",
        locals.log,
        rowsErr,
      );
    }

    const existingFeatures = existingRows.map((r) => r.feature);
    const newFeatures = Object.entries(features)
      .filter(([, present]) => present)
      .map(([key]) => normalizeKey(key));

    const toAdd = newFeatures.filter((f) => !existingFeatures.includes(f));
    const toRemove = existingFeatures.filter((f) => !newFeatures.includes(f));

    if (toAdd.length) {
      const insertPayload = toAdd.map((code) => ({
        cube: slug,
        feature: code,
      }));
      const { error: featUpErr } = await locals.supabase
        .from("cubes_model_features")
        .upsert(insertPayload);

      if (featUpErr) {
        return logError(
          500,
          "Failed to add cube features",
          locals.log,
          featUpErr,
        );
      }
    }

    if (toRemove.length) {
      const { error: featUpErr } = await locals.supabase
        .from("cubes_model_features")
        .delete()
        .eq("cube", slug)
        .in(
          "feature",
          toRemove.map((code) => code),
        );

      if (featUpErr) {
        return logError(
          500,
          "Failed to remove cube features",
          locals.log,
          featUpErr,
        );
      }
    }

    message(form, "Cube edited successfully!");
    throw redirect(301, `/staff/cubes/edit/${slug}`);
  },
};
