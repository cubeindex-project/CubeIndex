import type { PageServerLoad, Actions } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { slugify } from "$lib/components/slugify.svelte";
import { getSubTypes } from "$lib/components/subType.svelte";
import { z } from "zod/v4";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

const schema = z
  .object({
    id: z.number(),
    series: z.string().optional(),
    model: z.string().nonempty("Model is required"),
    versionType: z.literal(["Base", "Trim", "Limited"]),
    versionName: z.string().optional(),
    brand: z.string(),
    otherBrand: z.string().nonempty("Brand is required"),
    type: z.string().nonempty("Type is required"),
    sub_type: z.string().optional(),
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
    wcaLegal: z.boolean(),
    magnetic: z.boolean(),
    smart: z.boolean(),
    modded: z.boolean(),
    discontinued: z.boolean(),
    maglev: z.boolean(),
    stickered: z.boolean(),
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
      data.value.versionName &&
      data.value.versionName.trim() === ""
    ) {
      data.issues.push({
        code: "custom",
        message: "The version name is required when the cube type is not Base",
        input: data.value.versionName,
        path: ["versionName"],
      });
    }

    if (data.value.smart === true && data.value.wcaLegal === true) {
      data.issues.push({
        code: "custom",
        message: "Smart cubes can not be WCA Legal",
        input: data.value.wcaLegal,
        path: ["wcaLegal"],
      });
    }
  });

export const load = (async () => {
  const form = await superValidate(zod4(schema), { errors: false });

  return { form };
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

    const payload = {
      slug,
      series: data.series,
      model: data.model,
      version_name: data.versionName,
      brand: data.brand !== "___other" ? data.brand : data.otherBrand,
      type: data.type,
      sub_type: data.sub_type || getSubTypes(data.type),
      release_date: data.releaseDate,
      image_url: data.imageUrl,
      surface_finish: data.surfaceFinish,
      weight: data.weight,
      size: data.size,
      version_type: data.versionType,
      submitted_by: me.username,
      related_to: data.relatedTo,
      wca_legal: data.wcaLegal,
      magnetic: data.magnetic,
      smart: data.smart,
      modded: data.modded,
      discontinued: data.discontinued,
      maglev: data.maglev,
      stickered: data.stickered,
      status: "Pending",
    };

    const { error: insertErr } = await locals.supabase
      .from("cube_models")
      .insert(payload);

    if (insertErr) throw error(500, insertErr.message);

    message(form, "Cube added successfully!");
    throw redirect(301, `/explore/cubes/${slug}`);
  },
};
