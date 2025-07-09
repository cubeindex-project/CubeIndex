import { supabase } from "$lib/supabaseClient";
import { type Actions, fail, error, redirect } from "@sveltejs/kit";
import { slugify } from "$lib/components/slugify.svelte";
import { getSubTypes } from "$lib/components/subType.svelte";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { z } from "zod/v4";
import type { PageServerLoad } from "./$types.js";

const schema = z
  .object({
    id: z.number(),
    series: z.string().optional(),
    model: z.string().nonempty("Model is required"),
    versionType: z.literal(["Base", "Trim", "Limited"]),
    versionName: z.string().optional(),
    brand: z.string().nonempty("Brand is required"),
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

export const load: PageServerLoad = async ({ params }) => {
  const { slug } = params;

  const { data: cubes, error: cErr } = await supabase
    .from("cube_models")
    .select("*")
    .order("model", { ascending: true })
    .order("series", { ascending: true });

  if (cErr) {
    throw error(500, cErr.message);
  }

  const cube = cubes.find((c) => c.slug === slug);
  if (!cube) {
    throw error(404, `Cube “${slug}” not found`);
  }

  const cubeTrims = cubes.filter((c) => {
    return c.related_to === cube.slug;
  });

  const { data: vendor_links, error: vendorError } = await supabase
    .from("cube_vendor_links")
    .select("*")
    .eq("cube_slug", cube.slug);

  if (vendorError)
    throw error(
      500,
      `Failed to fetch vendor links for cube "${cube.slug}": ${vendorError.message}`
    );

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
      wcaLegal: cube.wca_legal,
      magnetic: cube.magnetic,
      smart: cube.smart,
      modded: cube.modded,
      discontinued: cube.discontinued,
      maglev: cube.maglev,
      stickered: cube.stickered,
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
    cubes,
    vendor_links,
    profiles,
    form,
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await superValidate(request, zod4(schema));

    const data = form.data;

    if (!form.valid) return fail(400, { form });

    const slug = slugify(
      `${data.series ? data.series : ""} ${data.model} ${
        data.versionName ? data.versionName : ""
      }`
    );

    const cubePayload = {
      slug,
      series: data.series,
      model: data.model,
      version_name: data.versionName,
      brand: data.brand,
      type: data.type,
      sub_type: data.sub_type ?? getSubTypes(data.type),
      release_date: data.releaseDate,
      image_url: data.imageUrl,
      surface_finish: data.surfaceFinish,
      weight: data.weight,
      size: data.size,
      version_type: data.versionType,
      related_to: data.relatedTo,
      wca_legal: data.wcaLegal,
      magnetic: data.magnetic,
      smart: data.smart,
      modded: data.modded,
      discontinued: data.discontinued,
      maglev: data.maglev,
      stickered: data.stickered,
      updated_at: new Date().toISOString(),
    };

    const vendorPayload = data.vendorLinks.map((vendorLink) => ({
      cube_slug: slug,
      vendor_name: vendorLink.vendor_name,
      url: vendorLink.url,
      available: vendorLink.available,
      price: vendorLink.price,
    }));

    const { error: updateErr } = await locals.supabase
      .from("cube_models")
      .update(cubePayload)
      .eq("id", data.id);

    if (updateErr) throw error(500, updateErr.message);

    const { error: upsertVenErr } = await locals.supabase
      .from("cube_vendor_links")
      .upsert(vendorPayload);

    if (
      upsertVenErr?.message ===
      'new row violates row-level security policy for table "cube_vendor_links"'
    )
      throw error(401, "You are not permitted to perform this action.");
    if (upsertVenErr) throw error(500, upsertVenErr.message);

    message(form, "Cube edited successfully!");
    throw redirect(301, `/staff/cubes/edit/${slug}`);
  },
};
