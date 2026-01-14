import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getEventPhase } from "$lib/components/helper_functions/eventPhase";
import { logError } from "$lib/server/logError";

export const load = (async ({ locals: { supabase, log }, params }) => {
  const year = params.year;

  const { data: event, error: eventErr } = await supabase
    .from("awards_event")
    .select("*")
    .eq("year", year)
    .maybeSingle();

  if (eventErr) {
    logError(500, "Failed to fetch the event data", log, eventErr);
  }

  if (!event) {
    logError(404, "Event not found", log, new Error("Event not found"));
  }

  const { data: categories, error: categoriesErr } = await supabase
    .from("awards_category")
    .select("*")
    .eq("event_id", event.id);

  if (categoriesErr) {
    logError(500, "Failed to fetch the categories data", log, categoriesErr);
  }

  const { data: winnerNominees, error: winnersErr } = await supabase
    .from("v_awards_category_winners")
    .select("nominee_slug, vote_count, nominee_count, category_id")
    .in(
      "category_id",
      categories.map((category) => category.id),
    );

  if (winnersErr) {
    log.error({ err: winnersErr }, "Failed to fetch the event winners");
    throw error(500, "Failed to fetch the event winners");
  }

  const { data: winnerCubes, error: winnerCubesErr } = await supabase
    .from("v_detailed_cube_models")
    .select("id, slug, name, image_url")
    .in(
      "slug",
      winnerNominees.map((w) => w.nominee_slug),
    );

  if (winnerCubesErr) {
    logError(500, "Failed to fetch the winner cubes data", log, winnerCubesErr);
  }

  const winners = winnerNominees.map((winner) => ({
    category_id: categories.find(
      (category) => category.id === winner.category_id,
    )?.id,
    cube: winnerCubes.find((cube) => cube.slug === winner.nominee_slug),
    voteCount: winner.vote_count,
    nomineeCount: winner.nominee_count,
  }));

  const eventPhase = getEventPhase(event);

  return {
    event,
    eventPhase,
    categories,
    winners,
    meta: { title: `${event.title} Results - CubeIndex Awards` },
  };
}) satisfies PageServerLoad;
