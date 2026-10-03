import { awardsVoteSchema } from "$lib/schemas/awards";
import { getZodErrorMessage } from "$lib/utils/getZodErrorMessage";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
  request,
  locals: { supabase, log, user },
}) => {
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    log.warn(
      { event: "awards.vote.submit_invalid_json" },
      "Awards vote submit request contained invalid JSON",
    );
    return json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsedPayload = awardsVoteSchema.safeParse(body);
  if (!parsedPayload.success) {
    log.warn(
      {
        event: "awards.vote.submit_validation_failed",
        issueCount: parsedPayload.error.issues.length,
      },
      "Awards vote submit request failed validation",
    );
    return json(
      { error: getZodErrorMessage(parsedPayload.error) },
      { status: 400 },
    );
  }

  const payload = parsedPayload.data;

  const { data: currentEvent, error: ceErr } = await supabase
    .from("awards_event")
    .select("id")
    .lte("start_at", now)
    .gte("end_at", now)
    .maybeSingle();

  if (ceErr) {
    log.error({ err: ceErr }, "Failed to verify the current event");
    return json(
      {
        error: "Failed to verify the current event",
      },
      { status: 500 },
    );
  }

  if (!currentEvent) {
    return json(
      {
        error: "No event is currently active",
      },
      { status: 400 },
    );
  }

  const { count: awardsUserVoteCount, error: auvcErr } = await supabase
    .from("awards_user_vote")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("category_id", payload.category_id);

  if (auvcErr) {
    log.error(
      { err: auvcErr },
      "Failed to verify if you have already voted for this category",
    );
    return json(
      {
        error: "Failed to verify if you have already voted for this category",
      },
      { status: 500 },
    );
  }

  if (awardsUserVoteCount && awardsUserVoteCount >= 1) {
    return json(
      { error: "You have already voted for this category" },
      { status: 400 },
    );
  }

  const { error: auvErr } = await supabase
    .from("awards_user_vote")
    .insert({ user_id: user.id, ...payload });

  if (auvErr) {
    if (auvErr.code === "23505") {
      return json(
        { error: "You have already voted for this cube in this category" },
        { status: 400 },
      );
    }
    log.error({ err: auvErr }, "Failed to insert user vote");
    return json(
      {
        error: "Failed to insert user vote",
      },
      { status: 500 },
    );
  }

  return new Response(null, { status: 204 });
};
