import type { PageServerLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", locals.user?.id)
    .single();

  if (profErr) throw error(500, profErr.message);

  const { data: submittedCubes, error: err } = await supabase
    .from("cube_models")
    .select("*")
    .eq("submitted_by", profile.username);

  if (err) throw error(500, err.message);

  return { submittedCubes };
}) satisfies PageServerLoad;
