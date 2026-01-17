import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { superValidate, message } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { z } from "zod/v4";
import type { UserCubeCondition } from "$lib/components/dbTableTypes";
import { logError } from "$lib/server/logError";

const conditionOptions = [
  "New in box",
  "New",
  "Good",
  "Fair",
  "Worn",
  "Poor",
  "Broken",
] as UserCubeCondition[];

const listingSchema = z.object({
  cube: z.string().min(2, "Cube is required"),
  condition: z.enum(conditionOptions),
  priceAmount: z.coerce.number().positive("Price must be greater than zero"),
  priceCurrency: z.string().length(3, "Currency must be a 3-letter code"),
  locationCountry: z.string().min(4, "Country must have more than 4 letters"),
  locationRegion: z
    .preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? undefined : value,
      z.string().optional(),
    )
    .optional(),
  description: z
    .preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? undefined : value,
      z.string().max(1000, "Description is too long").optional(),
    )
    .optional(),
  contactDetails: z.string().min(2, "Contact info is required"),
  imageUrl: z
    .preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? undefined : value,
      z.url("Image must be a valid URL").optional(),
    )
    .optional(),
  acceptAccurateListing: z
    .coerce
    .boolean()
    .refine((value) => value, "Confirm that the listing details are accurate"),
  acceptOwnership: z
    .coerce
    .boolean()
    .refine((value) => value, "Confirm that you own the cube being listed"),
  acceptSafeTransactions: z
    .coerce
    .boolean()
    .refine((value) => value, "Confirm that you will transact safely"),
  acceptNoProhibitedItems: z
    .coerce
    .boolean()
    .refine((value) => value, "Confirm that the listing avoids prohibited items"),
  acceptCommunication: z
    .coerce
    .boolean()
    .refine((value) => value, "Confirm respectful communication"),
});

export const load = (async ({ locals: { supabase } }) => {
  const form = await superValidate(
    {
      priceCurrency: "USD",
      acceptAccurateListing: false,
      acceptOwnership: false,
      acceptSafeTransactions: false,
      acceptNoProhibitedItems: false,
      acceptCommunication: false,
    },
    zod4(listingSchema),
    { errors: false },
  );

  const { data: currencies } = await supabase.rpc("get_types", {
    enum_type: "currencies",
  });

  return {
    form,
    conditions: conditionOptions,
    currencies,
    meta: {
      title: "Post a listing - CubeIndex",
    },
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ locals: { supabase, user, log }, request }) => {
    if (!user) throw error(401, "Unauthorized");

    const form = await superValidate(request, zod4(listingSchema));

    if (!form.valid) {
      return message(form, "Please fix the highlighted fields and try again.", {
        status: 400,
      });
    }

    const data = form.data;

    const payload = {
      seller_id: user.id,
      cube: data.cube,
      condition: data.condition,
      price: data.priceAmount,
      currency: data.priceCurrency.toUpperCase(),
      location_country: data.locationCountry.toUpperCase(),
      location_region: data.locationRegion ?? null,
      description: data.description ?? null,
      contact_details: data.contactDetails,
      image_url: data.imageUrl ?? null,
      status: "active",
    };

    const { data: listing, error: insertError } = await supabase
      .from("marketplace_listings")
      .insert(payload)
      .select("id")
      .single();

    if (insertError || !listing)
      logError(500, "Failed to create marketplace listing", log, insertError);

    throw redirect(303, `/marketplace/${listing.id}`);
  },
};
