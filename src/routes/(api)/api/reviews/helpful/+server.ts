import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

const helpfulRateLimit = new Map<string, number>();
const helpfulCooldownMs = 1500;

export const POST: RequestHandler = async ({
  locals: { supabase, user, log },
  request,
}) => {
  if (!user)
    return json({ success: false, error: "Unauthorized" }, { status: 401 });

  const {
    reviewId,
  }: {
    reviewId: number;
  } = await request.json();

  const rateLimitKey = `${user.id}:${reviewId}`;
  const now = Date.now();
  const last = helpfulRateLimit.get(rateLimitKey) ?? 0;
  if (now - last < helpfulCooldownMs) {
    return json(
      { error: "Please wait before toggling helpful again." },
      { status: 429 },
    );
  }
  helpfulRateLimit.set(rateLimitKey, now);

  const { count, error: selecErr } = await supabase
    .from("helpful_review")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("review_id", reviewId);

  if (selecErr) {
    log.error({ selecErr }, "An error occurred while inserting");
    return json(
      {
        error: "Couldn't fetch rows from helpful_rating",
      },
      { status: 500 },
    );
  }

  const helpfulCount = count ?? 0;

  const action: "add" | "remove" = helpfulCount > 0 ? "remove" : "add";

  if (helpfulCount > 0) {
    const { error: err } = await supabase
      .from("helpful_review")
      .delete()
      .eq("user_id", user.id)
      .eq("review_id", reviewId);

    if (err) {
      log.error({ err }, "An error occurred while inserting");
      return json(
        { error: "An error occurred while inserting" },
        { status: 500 },
      );
    }
  } else {
    const { error: err } = await supabase
      .from("helpful_review")
      .insert({ user_id: user.id, review_id: reviewId });

    if (err) {
      log.error({ err }, "An error occurred while inserting");
      return json(
        { error: "An error occurred while inserting" },
        { status: 500 },
      );
    }
  }

  return json({ action });
};
