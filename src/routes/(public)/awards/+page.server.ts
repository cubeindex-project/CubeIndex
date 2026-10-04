import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals: { supabase, log } }) => {
  const now = new Date().toISOString();

  const { data: fetchedCurrentEvent, error: ceErr } = await supabase
    .from("awards_event")
    .select("*")
    .lte("start_at", now)
    .gte("end_at", now)
    .maybeSingle();

  let currentEvent = fetchedCurrentEvent;

  if (ceErr) {
    log.error({ err: ceErr }, "Failed to fetch current event");
    throw error(500, "Failed to fetch current event");
  }

  if (!currentEvent) {
    const { data: next_event, error: nextEventErr } = await supabase
      .from("awards_event")
      .select("*")
      .gt("start_at", now)
      .order("start_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextEventErr) {
      log.error({ err: nextEventErr }, "Failed to fetch next event");
      throw error(500, "Failed to fetch next event");
    }

    currentEvent = next_event;
  }

  const { data: previousEvents, error: prevErr } = await supabase
    .from("awards_event")
    .select("*")
    .lt("end_at", now)
    .order("year", { ascending: false });

  if (prevErr) {
    log.error({ err: prevErr }, "Failed to fetch previous awards events");
    throw error(500, "Failed to fetch previous awards events");
  }

  const { data: logoDesigner, error: err } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("user_id", "b49da5bb-6d82-463e-b8ee-fd7c9feebde6")
    .maybeSingle();

  if (err) {
    log.error({ err }, "Unable to fetch the logo designer profile details");
    throw error(500, "Unable to fetch the logo designer profile details");
  }

  return {
    currentEvent,
    previousEvents,
    logoDesigner,
    meta: {
      title: "CubeIndex Awards",
      description:
        "Browse the CubeIndex Awards. Explore categories, nominees, and past winners to see which cubes the community has recognized.",
    },
  };
}) satisfies PageServerLoad;
