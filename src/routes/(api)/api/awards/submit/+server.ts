import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
  request,
  locals: { supabase, log, user },
}) => {
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    event_id,
    category_id,
    nominee_id,
  }: {
    event_id: number;
    category_id: number;
    nominee_id: number | null;
  } = await request.json();

  if (!nominee_id) {
    return json({ error: "The nominee ID is mandatory" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const user_id = user.id;

  const { count: current_event, error: ceErr } = await supabase
    .from("awards_event")
    .select("id", { count: "exact", head: true })
    .eq("id", event_id)
    .lte("start_at", now)
    .gte("end_at", now);

  if (ceErr) {
    log.error({ err: ceErr }, "Failed to verify the current event");
    return json(
      {
        error: "Failed to verify the current event",
      },
      { status: 500 }
    );
  }

  if (!current_event) {
    return json(
      {
        error: "This event is not currently active",
      },
      { status: 400 }
    );
  }

  const { count: event_category, error: ecErr } = await supabase
    .from("awards_category")
    .select("id", { count: "exact", head: true })
    .eq("event_id", event_id)
    .eq("id", category_id);

  if (ecErr) {
    log.error({ err: ecErr }, "Failed to verify the event category");
    return json(
      {
        error: "Failed to verify the event category",
      },
      { status: 500 }
    );
  }

  if (!event_category) {
    return json(
      {
        error: "This category is not part of the event",
      },
      { status: 400 }
    );
  }

  const { count: category_nominee, error: cnErr } = await supabase
    .from("awards_nominee")
    .select("id", { count: "exact", head: true })
    .eq("category_id", category_id)
    .eq("id", nominee_id);

  if (cnErr) {
    log.error(
      { err: cnErr },
      "Failed to verify if the nominee is part of the category"
    );
    return json(
      {
        error: "Failed to verify if the nominee is part of the category",
      },
      { status: 500 }
    );
  }

  if (!category_nominee) {
    return json(
      {
        error: "The nominee is not part of the category",
      },
      { status: 400 }
    );
  }

  const { count: awards_user_vote_count, error: auvcErr } = await supabase
    .from("awards_user_vote")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user_id)
    .eq("category_id", category_id);

  if (auvcErr) {
    log.error(
      { err: auvcErr },
      "Failed to verify if you have already voted for this category"
    );
    return json(
      {
        error: "Failed to verify if you have already voted for this category",
      },
      { status: 500 }
    );
  }

  if (awards_user_vote_count && awards_user_vote_count >= 1) {
    return json(
      { error: "You have already voted for this category" },
      { status: 400 }
    );
  }

  const payload = { user_id, nominee_id, category_id };

  const { error: auvErr } = await supabase
    .from("awards_user_vote")
    .insert([payload]);

  if (auvErr?.code === "23505") {
    return json(
      { error: "You have already voted for this cube in this category" },
      { status: 400 }
    );
  }

  if (auvErr) {
    log.error({ err: auvErr }, "Failed to insert user vote");
    return json(
      {
        error: "Failed to insert user vote",
      },
      { status: 500 }
    );
  }

  return json({ success: true });
};
