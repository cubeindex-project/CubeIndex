import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals: { supabase, log }, params }) => {
  const startedAt = performance.now();
  const now = new Date().getTime();

  const year = Number(params.year);

  if (Number.isNaN(year) || year < 0) {
    log.warn({ event: "awards.results.invalid_year" }, "Invalid awards year");
    throw error(404, "Event not found");
  }

  const { data: event, error: eventErr } = await supabase
    .from("awards_event")
    .select("*")
    .eq("year", year)
    .maybeSingle();

  if (eventErr) {
    log.error(
      {
        event: "awards.results.event_failed",
        errorCode: eventErr.code,
        year: Number.isSafeInteger(year) ? year : undefined,
      },
      "Failed to fetch the event data",
    );
    throw error(500, "Failed to fetch the event data");
  }

  if (!event) {
    log.warn(
      {
        event: "awards.results.event_not_found",
        year: Number.isSafeInteger(year) ? year : undefined,
      },
      "Awards event not found",
    );
    throw error(404, "Event not found");
  }

  const endAt = new Date(event.end_at).getTime();

  if (endAt >= now) {
    log.warn(
      {
        event: "awards.results.event_active",
        eventID: event.id,
        year: event.year,
      },
      "Awards results are not available for an active event",
    );
    throw error(404, "This event is currently active");
  }

  const { data: categories, error: categoriesErr } = await supabase
    .from("v_detailed_awards_category")
    .select("*")
    .eq("event_id", event.id);

  if (categoriesErr) {
    log.error(
      {
        event: "awards.results.categories_failed",
        errorCode: categoriesErr.code,
        eventID: event.id,
        year: event.year,
      },
      "Failed to fetch the categories data",
    );
    throw error(500, "Failed to fetch the categories data");
  }

  const { data: nominees, error: nomineesErr } = await supabase
    .from("v_detailed_awards_nominee")
    .select(
      "id, cube_id, vote_count, category_id, winner, rank, cube:v_detailed_cube_models!cube_id(id, slug, name, image_url)",
    )
    .in(
      "category_id",
      categories.map((category) => category.id),
    )
    .order("rank", { ascending: true });

  if (nomineesErr) {
    log.error(
      {
        event: "awards.results.nominees_failed",
        errorCode: nomineesErr.code,
        eventID: event.id,
        year: event.year,
      },
      "Failed to fetch the event winners",
    );
    throw error(500, "Failed to fetch the event winners");
  }

  log.info(
    {
      event: "awards.results.loaded",
      eventID: event.id,
      year: event.year,
      categoryCount: categories.length,
      nomineeCount: nominees.length,
      durationMs: performance.now() - startedAt,
    },
    "Loaded awards results",
  );

  return {
    event,
    categories,
    nominees,
    meta: { title: `${event.title} Results - CubeIndex Awards` },
  };
}) satisfies PageServerLoad;
