import type { PageServerLoad, Actions } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { slugify } from "$lib/components/slugify.svelte";
import { getSubTypes } from "$lib/components/subType.svelte";
import { z } from "zod/v4";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { cleanLink } from "$lib/components/linkCleaner";

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

export const load = (async ({ locals }) => {
  const form = await superValidate(zod4(schema), { errors: false });

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
  default: async ({ request, locals }) => {
    const form = await superValidate(request, zod4(schema));

    const data = form.data;

    // Figure out who’s submitting
    const { data: me, error: meErr } = await locals.supabase
      .from("profiles")
      .select("username")
      .eq("user_id", locals.user?.id)
      .single();

    if (meErr) throw error(500, meErr.message);

    const slug = slugify(
      `${data.series ? data.series : ""} ${data.model} ${
        data.versionName ? data.versionName : ""
      }`
    );

    if (data.type === "___other") {
      const { error: err } = await locals.supabase
        .from("cube_types")
        .insert([{ name: data.otherType, added_by: me.username }]);

      if (err)
        throw error(
          500,
          `Failed to add new cube type "${data.otherType}": ${err.message}`
        );
    }
    if (data.brand === "___other") {
      const { error: brandErr } = await locals.supabase
        .from("brands")
        .insert([{ name: data.otherBrand, added_by: me.username }]);

      if (brandErr)
        throw error(
          500,
          `Failed to add new brand "${data.otherBrand}": ${brandErr.message}`
        );
    }

    const payload = {
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
      surface_finish: data.surfaceFinish,
      weight: data.weight,
      size: data.size,
      version_type: data.versionType,
      submitted_by: me.username,
      related_to: data.relatedTo,
      status: "Pending",
    };

    const { error: insertErr } = await locals.supabase
      .from("cube_models")
      .insert(payload);

    if (insertErr) throw error(500, insertErr.message);

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

    message(form, "Cube added successfully!");
    throw redirect(301, `/explore/cubes/${slug}`);
  },
};
