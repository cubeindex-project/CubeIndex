import {
	cubeRatingDeleteSchema,
	cubeRatingUpsertSchema,
	type CubeRatingForm,
} from "$lib/schemas/cubeRating";
import { getZodErrorMessage } from "$lib/utils/getZodErrorMessage";

export async function saveCubeRating(
	cubeID: number,
	form: CubeRatingForm,
): Promise<void> {
	const parsedPayload = cubeRatingUpsertSchema.safeParse({
		cube_id: cubeID,
		...form,
	});

	if (!parsedPayload.success) {
		throw new Error(getZodErrorMessage(parsedPayload.error));
	}

	let response: Response;
	try {
		response = await fetch("/api/rating/cube/save", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(parsedPayload.data),
		});
	} catch (error) {
		throw new Error(
			"Network error. Please check your connection and try again.",
			{ cause: error },
		);
	}

	let data: { error?: string } | undefined;
	try {
		data = (await response.json()) as { error?: string };
	} catch {
		// An error response is allowed not to have a JSON body.
	}

	if (!response.ok) {
		throw new Error(
			data?.error ?? "Unable to submit rating. Please try again.",
		);
	}
}

export async function deleteCubeRating(ratingID: number): Promise<void> {
	const parsedPayload = cubeRatingDeleteSchema.safeParse({
		rating_id: ratingID,
	});

	if (!parsedPayload.success) {
		throw new Error(getZodErrorMessage(parsedPayload.error));
	}

	let response: Response;
	try {
		response = await fetch("/api/rating/cube/delete", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(parsedPayload.data),
		});
	} catch (error) {
		throw new Error(
			"Network error. Please check your connection and try again.",
			{ cause: error },
		);
	}

	let data: { error?: string } | undefined;
	try {
		data = (await response.json()) as { error?: string };
	} catch {
		// An error response is allowed not to have a JSON body.
	}

	if (!response.ok) {
		throw new Error(
			data?.error ?? "Unable to delete the rating. Please try again.",
		);
	}
}
