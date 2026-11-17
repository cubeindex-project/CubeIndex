import {
  helpfulRatingToggleSchema,
  type HelpfulRatingToggle,
} from "#lib/schemas/helpfulRating.ts";
import { getZodErrorMessage } from "#lib/utils/getZodErrorMessage.ts";
import { trackEvent } from "#lib/utils/umami.ts";

export async function toggleHelpfulCubeRating(
  payload: HelpfulRatingToggle,
): Promise<void> {
  const parsedPayload = helpfulRatingToggleSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error(getZodErrorMessage(parsedPayload.error));
  }

  let response: Response;
  try {
    response = await fetch("/api/rating/cube/toggle-helpful", {
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

  if (!response.ok) {
    let data: { error?: string } | undefined;
    try {
      data = (await response.json()) as { error?: string };
    } catch {
      // An error response is allowed not to have a JSON body.
    }

    throw new Error(
      data?.error ?? "Unable to update the helpful rating. Please try again.",
    );
  }

  trackEvent("cube-rating-helpfulness-toggled");
}
