import type { LayoutServerLoad } from "./$types";
import type { DetailedProfiles } from "$lib/components/dbTableTypes.js";
import { supabase } from "$lib/supabaseClient";
import { logError } from "$lib/server/logError";
import { removeMarkdown } from "$lib/components/helper_functions/removeMarkdown";

export const load = (async ({ locals: { user, log }, params, url }) => {
  const { username } = params;

  // 1) Profile
  const { data: profileRaw, error: err } = await supabase
    .from("v_detailed_profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (err) {
    return logError(500, "Unable to load profile", log, err);
  }

  const profile: DetailedProfiles | undefined = profileRaw;

  if (!profile) {
    return logError(
      404,
      "User not found",
      log,
      new Error(`Profile "${username}" not found`),
    );
  }

  let following: boolean = false;

  if (user?.id) {
    const { data, error: followErr } = await supabase
      .from("user_follows")
      .select("*")
      .eq("follower_id", user.id)
      .eq("following_id", profile.user_id);

    if (followErr) {
      return logError(500, "Unable to check follow status", log, followErr);
    }

    following = data.length !== 1;
  }

  return {
    profile,
    following,
    stats: {
      cubesCount: profile.user_cubes_count,
      achievementsCount: profile.user_achievements_count,
      followersCount: profile.user_follower_count,
      followingCount: profile.user_following_count,
    },
    meta: {
      title: `${profile.display_name}'s Profile - CubeIndex`,
      description: `View ${profile.display_name} (@${profile.username}) on CubeIndex. Explore their cube collection, ratings, reviews, and recent activity.`,
      ogImage: `${url.origin}/api/og/profile/${username}`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        dateCreated: profile.created_at,
        url: `${url.origin}/user/${username}`,
        mainEntity: {
          "@type": "Person",
          name: profile.display_name,
          alternateName: profile.username,
          identifier: profile.id,
          interactionStatistic: [
            {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/FollowAction",
              userInteractionCount: profile.user_follower_count,
            },
          ],
          agentInteractionStatistic: {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/WriteAction",
            userInteractionCount: profile.cube_reviews_count,
          },
          description: profile.bio
            ? removeMarkdown(profile.bio)
            : `View ${profile.display_name} (@${profile.username}) on CubeIndex. Explore their cube collection, ratings, reviews, and recent activity.`,
          image: profile.profile_picture ? profile.profile_picture : undefined,
          url: `${url.origin}/user/${username}`,
        },
      },
    },
  };
}) satisfies LayoutServerLoad;
