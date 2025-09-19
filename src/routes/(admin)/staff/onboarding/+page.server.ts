import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  const { data: responses, error: onboardingError } = await locals.supabase
    .from("user_onboarding")
    .select("id, user_id, discovered_via, interested_features, other_text")
    .order("id", { ascending: false });

  if (onboardingError) throw error(500, onboardingError.message);

  const userIds = (responses ?? []).map((entry) => entry.user_id).filter(Boolean);
  const uniqueUserIds = Array.from(new Set(userIds));

  if (uniqueUserIds.length === 0) {
    return {
      responses: responses ?? [],
      profiles: [],
    };
  }

  const { data: profiles, error: profilesError } = await locals.supabase
    .from("profiles")
    .select("user_id, username, display_name, created_at, onboarded, role")
    .in("user_id", uniqueUserIds);

  if (profilesError) throw error(500, profilesError.message);

  return {
    responses: responses ?? [],
    profiles: profiles ?? [],
  };
}) satisfies PageServerLoad;
