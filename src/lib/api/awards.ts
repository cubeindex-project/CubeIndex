import { awardsVoteSchema } from "$lib/schemas/awards";
import { getZodErrorMessage } from "$lib/utils/getZodErrorMessage";
import { trackEvent } from "$lib/utils/umami";

export async function submitAwardsVote(
  category_id: number,
  nominee_id: number,
) {
  const parsedPayload = awardsVoteSchema.safeParse({
    category_id,
    nominee_id,
  });

  if (!parsedPayload.success) {
    trackEvent("awards-vote-failed", { reason: "validation" });
    throw new Error(getZodErrorMessage(parsedPayload.error));
  }

  trackEvent("awards-vote-started", { category_id });

  let response: Response;
  let result: { error?: string };
  try {
    response = await fetch("/api/awards/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedPayload.data),
    });
  } catch (error) {
    trackEvent("awards-vote-failed", { category_id, reason: "network" });
    throw new Error(
      "Network error. Please check your connection and try again.",
      { cause: error },
    );
  }

  if (!response.ok) {
    trackEvent("awards-vote-failed", {
      category_id,
      reason: "server",
      status: response.status,
    });
    result = await response.json().catch(() => ({}));
    throw new Error(result.error || "Vote failed");
  }

  trackEvent("awards-vote-submitted", { category_id });
}
