import { awardsVoteSchema } from "$lib/schemas/awards";
import { getZodErrorMessage } from "$lib/utils/getZodErrorMessage";

export async function submitAwardsVote(
  category_id: number,
  nominee_id: number,
) {
  const parsedPayload = awardsVoteSchema.safeParse({
    category_id,
    nominee_id,
  });

  if (!parsedPayload.success) {
    throw new Error(getZodErrorMessage(parsedPayload.error));
  }

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
    throw new Error(
      "Network error. Please check your connection and try again.",
      { cause: error },
    );
  }

  if (!response.ok) {
    result = await response.json();
    throw new Error(result.error || "Vote failed");
  }
}
