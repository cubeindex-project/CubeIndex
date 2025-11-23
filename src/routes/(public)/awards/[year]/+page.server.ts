import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getEventPhase } from "$lib/components/helper_functions/eventPhase";

export const load = (async ({ locals: { supabase, log }, params }) => {
  const year = params.year;

  const { data: winnersData, error: winnersErr } = await supabase
    .from("v_awards_category_winners")
    .select("*")
    .eq("event_year", year);

  if (winnersErr) {
    log.error({ err: winnersErr }, "Failed to fetch the event winners");
    throw error(500, "Failed to fetch the event winners");
  }

  if (!winnersData?.length) {
    throw error(404, "Awards event not found");
  }

  const event = winnersData.map((w) => ({
    id: w.event_id,
    year: w.event_year,
    title: w.event_title,
    start_at: w.start_at,
    end_at: w.end_at,
    is_published: w.is_published,
  }))[0];

  const categories = winnersData.map((w) => ({
    id: w.category_id,
    name: w.category_name,
    icon: w.category_icon,
    description: w.category_description,
    nominees_count: w.nominees_count
  }));

  const winners = winnersData.map((w) => ({
    id: w.nominee_id,
    cube_id: w.cube_id,
    category_id: w.category_id,
    votes: w.votes,
    brand: w.brand,
    slug: w.cube_slug,
    image_url: w.image_url,
    version_type: w.version_type,
    name: w.cube_name,
  }));

  const eventPhase = getEventPhase(event)

  return { event, eventPhase, categories, winners };
}) satisfies PageServerLoad;
