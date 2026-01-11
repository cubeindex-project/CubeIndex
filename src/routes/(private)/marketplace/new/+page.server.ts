import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { superValidate, message } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { z } from "zod/v4";

const conditionOptions = [
	"New in box",
	"New",
	"Good",
	"Fair",
	"Worn",
	"Poor",
	"Broken",
] as const;

const listingSchema = z.object({
	cubeName: z.string().min(2, "Cube name is required"),
	cubeSlug: z
		.preprocess(
			(value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
			z.string().optional()
		)
		.optional(),
	condition: z.enum(conditionOptions),
	priceAmount: z.coerce.number().positive("Price must be greater than zero"),
	priceCurrency: z.string().length(3, "Currency must be a 3-letter code"),
	locationCountry: z
		.string()
		.length(2, "Country must be a 2-letter code"),
	locationRegion: z
		.preprocess(
			(value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
			z.string().optional()
		)
		.optional(),
	description: z
		.preprocess(
			(value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
			z.string().max(1000, "Description is too long").optional()
		)
		.optional(),
	contactMethod: z.enum(["external", "email", "discord", "other"]),
	contactValue: z.string().min(2, "Contact info is required"),
	imageUrl: z
		.preprocess(
			(value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
			z.string().url("Image must be a valid URL").optional()
		)
		.optional(),
});

export const load = (async () => {
	const form = await superValidate(
		{
			condition: conditionOptions[2],
			priceCurrency: "USD",
			locationCountry: "US",
			contactMethod: "external",
		},
		zod4(listingSchema),
		{ errors: false }
	);

	return {
		form,
		conditions: conditionOptions,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const { user, supabase } = locals;
		if (!user) throw error(401, "Unauthorized");

		const form = await superValidate(request, zod4(listingSchema));

		if (!form.valid) {
			return message(form, "Please fix the highlighted fields and try again.", {
				status: 400,
			});
		}

		const data = form.data;

		const { data: listing, error: insertError } = await supabase
			.from("marketplace_listings")
			.insert({
				seller_id: user.id,
				cube_slug: data.cubeSlug ?? null,
				cube_name: data.cubeName,
				condition: data.condition,
				price_amount: data.priceAmount,
				price_currency: data.priceCurrency.toUpperCase(),
				location_country: data.locationCountry.toUpperCase(),
				location_region: data.locationRegion ?? null,
				description: data.description ?? null,
				contact_method: data.contactMethod,
				contact_value: data.contactValue,
				image_url: data.imageUrl ?? null,
				status: "active",
			})
			.select("id")
			.single();

		if (insertError || !listing) {
			locals.log.error(
				{ err: insertError?.message },
				"Failed to create marketplace listing"
			);
			return message(form, "Unable to create your listing right now.", {
				status: 500,
			});
		}

		throw redirect(303, `/marketplace/${listing.id}`);
	},
};
