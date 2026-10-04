import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals: { supabase, log }, params }) => {
  const now = new Date().getTime();

  const year = Number(params.year);

  if (Number.isNaN(year) || year < 0) throw error(404, "Event not found");

  const { data: event, error: eventErr } = await supabase
    .from("awards_event")
    .select("*")
    .eq("year", year)
    .maybeSingle();

  if (eventErr) {
    log.error({ err: eventErr }, "Failed to fetch the event data");
    throw error(500, "Failed to fetch the event data");
  }

  if (!event) {
    throw error(404, "Event not found");
  }

  const endAt = new Date(event.end_at).getTime();

  if (endAt >= now) {
    throw error(404, "This event is currently active");
  }

  const { data: categories, error: categoriesErr } = await supabase
    .from("v_detailed_awards_category")
    .select("*")
    .eq("event_id", event.id);

  if (categoriesErr) {
    log.error({ err: categoriesErr }, "Failed to fetch the categories data");
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
    log.error({ err: nomineesErr }, "Failed to fetch the event winners");
    throw error(500, "Failed to fetch the event winners");
  }

  return {
    event,
    categories,
    nominees,
    meta: { title: `${event.title} Results - CubeIndex Awards` },
  };
}) satisfies PageServerLoad;
