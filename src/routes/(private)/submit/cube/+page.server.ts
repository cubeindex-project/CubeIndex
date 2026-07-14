import type { Actions, PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { slugify } from "$lib/components/helper_functions/slugify.svelte";
import { getSubTypes } from "$lib/components/helper_functions/subType.svelte";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { cleanLink } from "$lib/components/helper_functions/linkCleaner";
import type { TablesInsert } from "$lib/types/database.types";
import { cubeFormSchema, normalizeReleaseDate } from "$lib/schemas/cubeForm";
import { loadCubeFormOptions } from "$lib/server/cube/loadCubeFormOptions";

export const load = (async ({ locals: { log, supabase } }) => {
  const [form, options] = await Promise.all([
    superValidate(zod4(cubeFormSchema), { errors: false }),
    loadCubeFormOptions(supabase, log),
  ]);

  return {
    form,
    formOptions: options,
    meta: {
      title: "New Submission - CubeIndex",
    },
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const { supabase, user } = locals;
    if (!user) throw error(401, "Unauthorized");

    const form = await superValidate(request, zod4(cubeFormSchema));
    if (!form.valid) {
      return message(form, "Please fix the highlighted fields and try again.", {
        status: 400,
      });
    }

    const data = form.data;

    let brand = data.brand;
    let cubeType = data.type;
    let seriesID = data.seriesId;

    if (data.brand === "___other") {
      brand = data.otherBrand;
      const { error: brandErr } = await supabase
        .from("brands")
        .insert([{ name: data.otherBrand, added_by_id: user.id }]);

      if (brandErr) {
        locals.log.error({ err: brandErr.message }, "Failed to add new brand");
        return setError(form, "An error occurred while adding the new brand", {
          status: 500,
        });
      }
    }
    if (data.type === "___other") {
      cubeType = data.otherType;
      const { error: typeErr } = await locals.supabase
        .from("cube_types")
        .insert([{ name: data.otherType, added_by_id: user.id }]);

      if (typeErr) {
        locals.log.error(
          { err: typeErr.message },
          "Failed to add new cube type",
        );
        return setError(
          form,
          "An error occurred while adding the new cube typ",
          {
            status: 500,
          },
        );
      }
    }
    if (data.otherSeries) {
      const { data: series, error: seriesErr } = await supabase
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
      data.subType === "auto" ? getSubTypes(cubeType) : data.subType;

    const releaseDate = data.releaseDate
      ? normalizeReleaseDate(data.releaseDate)
      : null;

    const payload: TablesInsert<"cube_models"> = {
      name: data.name,
      slug: slugify(data.name),
      series_id: seriesID,
      brand: brand,
      type: cubeType,
      sub_type: subType,
      release_date: releaseDate?.date,
      release_date_precision: releaseDate?.precision,
      image_url: cleanLink(data.imageUrl),
      surface_finish: data.surfaceFinish,
      weight: data.weight,
      size: data.size,
      version_type: data.versionType,
      related_to_id: data.relatedToId,
      submitted_by_id: user.id,
      discontinued: data.discontinued,
    };

    const { data: insertData, error: insertErr } = await supabase
      .from("cube_models")
      .insert(payload)
      .select()
      .single();

    if (insertErr?.code === "23505") {
      return setError(form, "This cube already exists in our database.", {
        status: 400,
      });
    }

    if (insertErr) {
      locals.log.error({ err: insertErr.message }, "Failed to insert cube");
      return setError(form, "An error occurred while submitting the cube", {
        status: 500,
      });
    }

    const features = data.features;

    // Convert camelCase keys from the form to snake_case codes stored in the database
    const normalizeKey = (key: string) =>
      key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);

    const { data: existingRows, error: rowsErr } = await supabase
      .from("cubes_model_features")
      .select("feature")
      .eq("cube", insertData.slug);

    if (rowsErr) {
      locals.log.error({ err: rowsErr.message }, "Failed to fetch features");
      return setError(form, "An error occurred while submitting the cube", {
        status: 500,
      });
    }

    const existingFeatures = existingRows.map((row) => row.feature);
    const newFeatures = Object.entries(features)
      .filter(([, present]) => present)
      .map(([key]) => normalizeKey(key));

    const toAdd = newFeatures.filter(
      (feature) => !existingFeatures.includes(feature),
    );
    const toRemove = existingFeatures.filter(
      (feature) => !newFeatures.includes(feature),
    );

    if (toAdd.length) {
      const insertPayload = toAdd.map((feature) => ({
        cube: insertData.slug,
        feature,
      }));
      const { error: featUpErr } = await supabase
        .from("cubes_model_features")
        .upsert(insertPayload);

      if (featUpErr) {
        locals.log.error(
          { err: featUpErr.message },
          "Failed to insert features",
        );
        return setError(form, "An error occurred while submitting the cube", {
          status: 500,
        });
      }
    }

    if (toRemove.length) {
      const { error: featUpErr } = await supabase
        .from("cubes_model_features")
        .delete()
        .eq("cube", insertData.slug)
        .in("feature", toRemove);

      if (featUpErr) {
        locals.log.error(
          { err: featUpErr.message },
          "Failed to delete features",
        );
        return setError(form, "An error occurred while submitting the cube", {
          status: 500,
        });
      }
    }

    return message(
      form,
      'Cube submitted for review! Track its status on <a class="link" href="/user/submissions">your submissions page</a>.',
    );
  },
};
