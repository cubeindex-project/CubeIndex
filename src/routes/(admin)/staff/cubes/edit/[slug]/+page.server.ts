import { supabase } from "$lib/supabaseClient";
import { type Actions, fail, error, redirect } from "@sveltejs/kit";
import { slugify } from "$lib/components/slugify.svelte";
import { getSubTypes } from "$lib/components/subType.svelte";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { z } from "zod/v4";
import type { PageServerLoad } from "./$types.js";
import { cleanLink } from "$lib/components/linkCleaner.js";
import type { CubeType } from "$lib/components/cube.svelte.js";

const schema = z
  .object({
    id: z.number(),
    series: z.string().optional(),
    model: z.string().nonempty("Model is required"),
    versionType: z.literal(["Base", "Trim", "Limited"]),
    versionName: z.string().optional(),
    brand: z.string().nonempty("Brand is required"),
    otherBrand: z.string(),
    type: z.string().nonempty("Type is required"),
    otherType: z.string(),
    sub_type: z.string().nonempty("Sub Type is required"),
    relatedTo: z.string().optional(),
    releaseDate: z
      .string()
      .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
        error: "Release date must be YYYY-MM-DD",
      }),
    imageUrl: z.url("Image URL must be valid"),
    surfaceFinish: z.string().optional(),
    weight: z.coerce.number().min(0, "Weight must be ≥ 0"),
    size: z.coerce.number().min(0, "Size must be ≥ 0"),
    features: z
      .object({
        wcaLegal: z.boolean(),
        magnetic: z.boolean(),
        smart: z.boolean(),
        modded: z.boolean(),
        discontinued: z.boolean(),
        maglev: z.boolean(),
        stickered: z.boolean(),
        ballCore: z.boolean(),
      })
      .check((data) => {
        if (data.value.smart === true && data.value.wcaLegal === true) {
          data.issues.push({
            code: "custom",
            message: "Smart cubes can not be WCA Legal",
            input: data.value.wcaLegal,
            path: ["wcaLegal"],
          });
        }
      }),
    vendorLinks: z.array(
      z.object({
        vendor_name: z.string().nonempty("Vendor name is required"),
        url: z.url("Must be a valid URL"),
        price: z.coerce.number().min(0, "Price must be ≥ 0"),
        available: z.boolean(),
      })
    ),
  })
  // enforce versionName when versionType !== 'Base'
  .check((data) => {
    if (
      data.value.versionType !== "Base" &&
      ((data.value.versionName && data.value.versionName.trim() === "") ||
        !data.value.versionName)
    ) {
      data.issues.push({
        code: "custom",
        message: "The version name is required when the cube type is not Base",
        input: data.value.versionName,
        path: ["versionName"],
      });
    }

    if (data.value.brand === "___other" && !data.value.otherBrand) {
      data.issues.push({
        code: "custom",
        message: "Brand is required",
        input: data.value.otherBrand,
        path: ["otherBrand"],
      });
    }

    if (data.value.type === "___other" && !data.value.otherType) {
      data.issues.push({
        code: "custom",
        message: "A Type is required",
        input: data.value.otherType,
        path: ["otherType"],
      });
    }
  });

export const load: PageServerLoad = async ({ params }) => {
  const { slug } = params;

  let cube: CubeType = {} as CubeType;

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
    .select("type")
    .order("type", { ascending: true });

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
      sub_type: cube.sub_type,
      releaseDate: cube.release_date,
      imageUrl: cube.image_url,
      surfaceFinish: cube.surface_finish,
      weight: cube.weight,
      size: cube.size,
      versionType: cube.version_type,
      relatedTo: cube.related_to,
      features: {
        wcaLegal: features.some((f) => f.feature === "wca_legal"),
        magnetic: features.some((f) => f.feature === "magnetic"),
        smart: features.some((f) => f.feature === "smart"),
        modded: features.some((f) => f.feature === "modded"),
        discontinued: features.some((f) => f.feature === "discontinued"),
        maglev: features.some((f) => f.feature === "maglev"),
        stickered: features.some((f) => f.feature === "stickered"),
        ballCore: features.some((f) => f.feature === "ball_core"),
      },
      vendorLinks: vendor_links,
    },
    zod4(schema),
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
    const form = await superValidate(request, zod4(schema));

    const data = form.data;

    if (!form.valid)
      return fail(400, {
        form,
        message: "There are errors in your submission. Please review the highlighted fields and try again.",
      });

    const { data: currentUser, error: profileErr } = await locals.supabase
      .from("profiles")
      .select("*")
      .eq("user_id", locals.user?.id)
      .single();

    if (profileErr)
      throw error(500, `Failed to fetch user profile: ${profileErr.message}`);

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
        .insert([{ type: data.otherType, added_by: currentUser.username }]);

      if (err)
        throw error(
          500,
          `Failed to add new cube type "${data.otherType}": ${err.message}`
        );
    }
    if (data.brand === "___other") {
      const { error: brandErr } = await locals.supabase
        .from("brands")
        .insert([{ brand: data.otherBrand, added_by: currentUser.username }]);

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
                ""
            )
          : data.sub_type,
      release_date: data.releaseDate.trim(),
      image_url: cleanLink(data.imageUrl),
      surface_finish: data.surfaceFinish?.trim(),
      weight: data.weight,
      size: data.size,
      version_type: data.versionType,
      related_to: data.relatedTo?.trim(),
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
