import type { PageServerLoad, Actions } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { slugify } from "$lib/components/helper_functions/slugify.svelte";
import { getSubTypes } from "$lib/components/helper_functions/subType.svelte";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { cleanLink } from "$lib/components/helper_functions/linkCleaner";
import { cubeSchema } from "$lib/components/validation/cubeForm";

export const load = (async ({ locals }) => {
  const form = await superValidate(zod4(cubeSchema), { errors: false });

  const { data: brands, error: brandsErr } = await locals.supabase
    .from("brands")
    .select("name")
    .order("name", { ascending: true });

  if (brandsErr) throw error(500, brandsErr.message);

  const { data: types, error: typesError } = await locals.supabase
    .from("cube_types")
    .select("name")
    .order("name", { ascending: true });

  if (typesError)
    throw error(500, `Failed to fetch types: ${typesError.message}`);

  const { data: surfaces } = await locals.supabase.rpc("get_types", {
    enum_type: "cube_surface_finishes",
  });

  const { data: subTypes } = await locals.supabase.rpc("get_types", {
    enum_type: "cubes_subtypes",
  });

  return { form, brands, types, surfaces, subTypes };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, locals: { supabase, user } }) => {
    if (!user) throw error(401, "Unauthorized");

    const form = await superValidate(request, zod4(cubeSchema));

    const data = form.data;

    const slug = slugify(
      `${data.series ? data.series : ""} ${data.model} ${
        data.versionName ? data.versionName : ""
      }`
    );

    const payload = {
      slug,
      series: data.series?.trim(),
      model: data.model.trim(),
      version_name: data.versionType === "Base" ? "" : data.versionName?.trim(),
      brand: data.brand.trim(),
      type: data.type.trim(),
      sub_type:
        data.sub_type === "auto"
          ? getSubTypes(data.type.trim())
          : data.sub_type,
      release_date: data.releaseDate.trim(),
      image_url: cleanLink(data.imageUrl),
      surface_finish: data.surfaceFinish,
      weight: data.weight,
      size: data.size,
      version_type: data.versionType,
      related_to: data.relatedTo,
      submitted_by_id: user.id,
      discontinued: data.discontinued,
      status: "Pending",
      verified_by_id: null,
      notes: "",
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const { error: insertErr } = await supabase
      .from("cube_models")
      .insert(payload);

    if (insertErr) throw error(500, insertErr.message);

    const features = data.features;

    // Map camelCase → snake_case or to your exact codes if needed
    const normalizeKey = (key: string) =>
      key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);

    const { data: existingRows, error: rowsErr } = await supabase
      .from("cubes_model_features")
      .select("*")
      .eq("cube", slug);

    if (rowsErr)
      throw error(
        500,
        `Failed to fetch existing cube features: ${rowsErr.message}`
      );

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
      const { error: featUpErr } = await supabase
        .from("cubes_model_features")
        .upsert(insertPayload);

      if (featUpErr)
        throw error(
          500,
          `Failed to add new features to cube: ${featUpErr.message}`
        );
    }

    if (toRemove.length) {
      const { error: featUpErr } = await supabase
        .from("cubes_model_features")
        .delete()
        .eq("cube", slug)
        .in(
          "feature",
          toRemove.map((code) => code)
        );

      if (featUpErr)
        throw error(
          500,
          `Failed to remove features from cube: ${featUpErr.message}`
        );
    }

    message(form, "Cube added successfully!");
    throw redirect(301, `/explore/cubes/${slug}`);
  },
};
