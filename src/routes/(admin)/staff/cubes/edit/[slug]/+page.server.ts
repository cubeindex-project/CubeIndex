import { supabase } from "$lib/supabaseClient";
import { type Actions, fail, error, redirect } from "@sveltejs/kit";
import { slugify } from "$lib/components/helper_functions/slugify.svelte.js";
import { getSubTypes } from "$lib/components/helper_functions/subType.svelte.js";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types.js";
import { cleanLink } from "$lib/components/helper_functions/linkCleaner.js";
import type { Cube } from "$lib/components/dbTableTypes.js";
import { cubeSchema } from "$lib/components/validation/cubeForm.js";

export const load: PageServerLoad = async ({ params }) => {
  const { slug } = params;

  let cube: Cube = {} as Cube;

  const { data, error: cErr } = await supabase
    .from("cube_models")
    .select("*")
    .eq("slug", slug)
    .single();

  if (cErr) {
    throw error(500, "Failed cube fetch " + cErr.message);
  }

  cube = data;

  const { data: cubeTrims, error: ctErr } = await supabase
    .from("cube_models")
    .select("*")
    .eq("related_to", cube.slug);

  if (ctErr) {
    throw error(500, "Failed cube trims fetch " + ctErr.message);
  }

  let relatedCube = [];

  if (cube.related_to) {
    const { data, error: rcErr } = await supabase
      .from("cube_models")
      .select("*")
      .eq("slug", cube.related_to)
      .single();

    if (rcErr) {
      throw error(500, "Failed related cube fetch " + rcErr.message);
    }

    relatedCube = data;
  }

  const { data: sameSeries, error: ssErr } = await supabase
    .from("cube_models")
    .select("*")
    .eq("series", cube.series)
    .eq("version_type", "Base")
    .neq("model", cube.model);

  if (ssErr) {
    throw error(500, "Failed same series fetch " + ssErr.message);
  }

  const { data: vendor_links, error: vlError } = await supabase
    .from("cube_vendor_links")
    .select("*")
    .eq("cube_slug", slug);

  if (vlError)
    throw error(
      500,
      `Failed to fetch vendor links for cube "${slug}": ${vlError.message}`
    );

  const { data: vendors, error: vendorError } = await supabase
    .from("vendors")
    .select("name, base_url");

  if (vendorError)
    throw error(500, `Failed to fetch vendors: ${vendorError.message}`);

  const { data: types, error: typesError } = await supabase
    .from("cube_types")
    .select("name")
    .order("name", { ascending: true });

  if (typesError)
    throw error(500, `Failed to fetch types: ${typesError.message}`);

  const { data: features, error: featErr } = await supabase
    .from("cubes_model_features")
    .select("*")
    .eq("cube", cube.slug);

  if (featErr) throw error(500, featErr.message);

  const form = await superValidate(
    {
      id: cube.id,
      series: cube.series,
      model: cube.model,
      versionName: cube.version_name,
      brand: cube.brand,
      type: cube.type,
      sub_type: cube.sub_type ?? "auto",
      releaseDate: cube.release_date,
      imageUrl: cube.image_url,
      surfaceFinish: cube.surface_finish,
      weight: cube.weight,
      size: cube.size,
      versionType: cube.version_type,
      relatedTo: cube.related_to,
      discontinued: cube.discontinued,
      features: {
        wcaLegal: features.some((f) => f.feature === "wca_legal"),
        magnetic: features.some((f) => f.feature === "magnetic"),
        smart: features.some((f) => f.feature === "smart"),
        modded: features.some((f) => f.feature === "modded"),
        maglev: features.some((f) => f.feature === "maglev"),
        stickered: features.some((f) => f.feature === "stickered"),
        ballCore: features.some((f) => f.feature === "ball_core"),
      },
      vendorLinks: vendor_links,
    },
    zod4(cubeSchema),
    { errors: false }
  );

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username");

  if (profilesError)
    throw error(500, `Failed to fetch profiles: ${profilesError.message}`);

  return {
    cube,
    cubeTrims,
    relatedCube,
    sameSeries,
    vendor_links,
    vendors,
    profiles,
    types,
    features,
    form,
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await superValidate(request, zod4(cubeSchema));

    const data = form.data;

    if (!form.valid)
      return fail(400, {
        form,
        message:
          "There are errors in your submission. Please review the highlighted fields and try again.",
      });

    const slug = slugify(
      `${data.series ? data.series.trim() : ""} ${data.model.trim()} ${
        data.versionType !== "Base"
          ? data.versionName
            ? data.versionName.trim()
            : ""
          : ""
      }`
    );

    if (data.type === "___other") {
      const { error: err } = await locals.supabase
        .from("cube_types")
        .insert([{ name: data.otherType, added_by_id: locals.user?.id }]);

      if (err)
        throw error(
          500,
          `Failed to add new cube type "${data.otherType}": ${err.message}`
        );
    }
    if (data.brand === "___other") {
      const { error: brandErr } = await locals.supabase
        .from("brands")
        .insert([{ name: data.otherBrand, added_by_id: locals.user?.id }]);

      if (brandErr)
        throw error(
          500,
          `Failed to add new brand "${data.otherBrand}": ${brandErr.message}`
        );
    }

    const cubePayload = {
      slug,
      series: data.series?.trim(),
      model: data.model.trim(),
      version_name: data.versionType === "Base" ? "" : data.versionName?.trim(),
      brand: data.brand !== "___other" ? data.brand?.trim() : data.otherBrand,
      type: data.type !== "___other" ? data.type?.trim() : data.otherType,
      sub_type:
        data.sub_type === "auto"
          ? getSubTypes(
              (data.type !== "___other" ? data.type?.trim() : data.otherType) ??
                null
            )
          : data.sub_type,
      release_date: data.releaseDate.trim(),
      image_url: cleanLink(data.imageUrl),
      surface_finish: data.surfaceFinish?.trim(),
      weight: data.weight,
      size: data.size,
      version_type: data.versionType,
      related_to: data.relatedTo?.trim(),
      discontinued: data.discontinued,
      notes: "",
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
      .eq("id", data.id);

    if (updateErr)
      throw error(
        500,
        `Failed to update cube information: ${updateErr.message}`
      );

    const { error: upsertVenErr } = await locals.supabase
      .from("cube_vendor_links")
      .upsert(vendorPayload);

    if (
      upsertVenErr?.message ===
      'new row violates row-level security policy for table "cube_vendor_links"'
    )
      throw error(
        401,
        "You do not have permission to update vendor links for this cube."
      );
    if (upsertVenErr)
      throw error(
        500,
        `Failed to update vendor links: ${upsertVenErr.message}`
      );

    const features = data.features;

    // Map camelCase → snake_case or to your exact codes if needed
    const normalizeKey = (key: string) =>
      key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);

    const { data: existingRows, error: rowsErr } = await locals.supabase
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
      const { error: featUpErr } = await locals.supabase
        .from("cubes_model_features")
        .upsert(insertPayload);

      if (featUpErr)
        throw error(
          500,
          `Failed to add new features to cube: ${featUpErr.message}`
        );
    }

    if (toRemove.length) {
      const { error: featUpErr } = await locals.supabase
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

    message(form, "Cube edited successfully!");
    throw redirect(301, `/staff/cubes/edit/${slug}`);
  },
};
