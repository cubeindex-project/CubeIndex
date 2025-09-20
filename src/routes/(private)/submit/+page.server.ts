import type { PageServerLoad, Actions } from "./$types";
import { error } from "@sveltejs/kit";
import { slugify } from "$lib/components/helper_functions/slugify.svelte";
import { getSubTypes } from "$lib/components/helper_functions/subType.svelte";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { cleanLink } from "$lib/components/helper_functions/linkCleaner";
import { cubeSchema } from "$lib/components/validation/cubeForm";

export const load = (async ({ locals }) => {
  const form = await superValidate(zod4(cubeSchema), { errors: false });

  const { data: cubes, error: cubesErr } = await locals.supabase
    .from("cube_models")
    .select("*")
    .neq("status", "Rejected");
  if (cubesErr) throw error(500, cubesErr.message);

  const { data: brands, error: brandsErr } = await locals.supabase
    .from("brands")
    .select("name")
    .order("name", { ascending: true });

  if (brandsErr) throw error(500, brandsErr.message);

  const { data: types, error: typesError } = await locals.supabase
    .from("cube_types")
    .select("name")
    .order("name", { ascending: true });

  if (typesError) {
    throw error(500, `Failed to fetch types: ${typesError.message}`);
  }

  const { data: surfaces, error: surfacesErr } = await locals.supabase.rpc(
    "get_types",
    {
      enum_type: "cube_surface_finishes",
    }
  );

  if (surfacesErr) {
    throw error(
      500,
      `Failed to fetch surface finishes: ${surfacesErr.message}`
    );
  }

  const { data: subTypes, error: subTypesErr } = await locals.supabase.rpc(
    "get_types",
    {
      enum_type: "cubes_subtypes",
    }
  );

  if (subTypesErr) {
    throw error(500, `Failed to fetch sub types: ${subTypesErr.message}`);
  }

  return { form, cubes, brands, types, surfaces, subTypes };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, locals: { supabase, user, log } }) => {
    if (!user) throw error(401, "Unauthorized");

    const form = await superValidate(request, zod4(cubeSchema));

    if (!form.valid) {
      return message(form, "Please fix the highlighted fields and try again.", {
        status: 400,
      });
    }

    const data = form.data;

    const slugSource = [
      data.series && data.series.length > 0 ? data.series : null,
      data.model,
      data.versionType === "Base" ? null : data.versionName ?? null,
    ]
      .filter((value): value is string => Boolean(value && value.length > 0))
      .join(" ");

    const slug = slugify(slugSource);

    if (!slug) {
      return message(
        form,
        "Unable to derive a slug from the provided model details.",
        { status: 400 }
      );
    }

    const computedSubType =
      data.sub_type === "auto" ? getSubTypes(data.type) : data.sub_type;

    const now = new Date().toISOString();

    const payload = {
      slug,
      series: data.series && data.series.length > 0 ? data.series : null,
      model: data.model,
      version_name: data.versionType === "Base" ? "" : data.versionName ?? "",
      brand: data.brand,
      type: data.type,
      sub_type: computedSubType,
      release_date: data.releaseDate,
      image_url: cleanLink(data.imageUrl),
      surface_finish: data.surfaceFinish,
      weight: data.weight,
      size: data.size,
      version_type: data.versionType,
      related_to:
        data.relatedTo && data.relatedTo.length > 0 ? data.relatedTo : null,
      submitted_by_id: user.id,
      discontinued: data.discontinued,
      status: "Pending",
      verified_by_id: null,
      notes: "",
      updated_at: now,
      created_at: now,
    } satisfies Record<string, unknown>;

    const { error: insertErr } = await supabase
      .from("cube_odels")
      .insert(payload);

    if (
      insertErr?.message ===
      'duplicate key value violates unique constraint "cubes_name_id_key"'
    ) {
      return message(form, `This cube already exists in our database.`, {
        status: 500,
      });
    }

    if (insertErr) {
      log.debug({ code: insertErr.code, details: insertErr.details, hint: insertErr.hint })
      log.error(insertErr.message);
      return message(form, `An error occured while submitting the cube`, {
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
      .eq("cube", slug);

    if (rowsErr) {
      throw error(
        500,
        `Failed to fetch existing cube features: ${rowsErr.message}`
      );
    }

    const rows = existingRows ?? [];
    const existingFeatures = rows.map((row) => row.feature);
    const newFeatures = Object.entries(features)
      .filter(([, present]) => present)
      .map(([key]) => normalizeKey(key));

    const toAdd = newFeatures.filter(
      (feature) => !existingFeatures.includes(feature)
    );
    const toRemove = existingFeatures.filter(
      (feature) => !newFeatures.includes(feature)
    );

    if (toAdd.length) {
      const insertPayload = toAdd.map((feature) => ({
        cube: slug,
        feature,
      }));
      const { error: featUpErr } = await supabase
        .from("cubes_model_features")
        .upsert(insertPayload);

      if (featUpErr) {
        throw error(
          500,
          `Failed to add new features to cube: ${featUpErr.message}`
        );
      }
    }

    if (toRemove.length) {
      const { error: featUpErr } = await supabase
        .from("cubes_model_features")
        .delete()
        .eq("cube", slug)
        .in("feature", toRemove);

      if (featUpErr) {
        throw error(
          500,
          `Failed to remove features from cube: ${featUpErr.message}`
        );
      }
    }

    return message(
      form,
      'Cube submitted for review! Track its status on <a class="link" href="/user/submissions">your submissions page</a>.'
    );
  },
};
