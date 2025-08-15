import type { LayoutLoad } from "./$types";
import { error } from "@sveltejs/kit";
import type { UserFollowsRow } from "$lib/components/dbTableTypes.js";
import { supabase } from "$lib/supabaseClient";
import { page } from "$app/state";

function plural(n: number, s: string, p = s + "s") {
  return `${n} ${n === 1 ? s : p}`;
}

function stripToPlain(input?: string | null) {
  if (!input) return "";
  // remove HTML/MD-ish markup & collapse whitespace
  return input
    .replace(/<[^>]+>/g, "")
    .replace(/[#*_>`~[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildProfileDescription(
  profile: {
    display_name?: string | null;
    username: string;
    bio?: string | null;
    created_at?: string | null;
  },
  stats: {
    cubesCount: number;
    achievementsCount: number;
    followersCount: number;
    followingCount: number;
  }
) {
  const name = profile.display_name?.trim() || profile.username;
  const handle = `@${profile.username}`;

  const bits: string[] = [];
  bits.push(`${name} (${handle}) on CubeIndex.`);

  const bio = stripToPlain(profile.bio);
  if (bio) bits.push(bio);

  const counts: string[] = [];
  counts.push(plural(stats.cubesCount, "cube"));
  counts.push(plural(stats.achievementsCount, "achievement"));
  counts.push(plural(stats.followersCount, "follower"));
  counts.push(plural(stats.followingCount, "following"));
  bits.push(counts.join(" • "));

  // keep to ~160 chars for search snippets
  let desc = bits.join(" ");
  if (desc.length > 160) desc = desc.slice(0, 157) + "…";
  return desc;
}

export const load = (async ({params, parent}) => {
  const { username } = params;
  const { user } = await parent();

  // 1) Profile
  const { data: profile, error: err } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (err) throw error(500, err.message);

  if (!profile) throw error(404, "User not found");

  let following: UserFollowsRow[] = [];

  if (user?.id) {
    const { data, error: followErr } = await supabase
      .from("user_follows")
      .select("*")
      .eq("follower_id", user.id)
      .eq("following_id", profile.user_id);

    if (followErr) throw error(500, followErr.message);

    following = data;
  }

  // 2) Stats (counts via HEAD+exact)
  const [
    { count: followersCount = 0, error: f1Err },
    { count: followingCount = 0, error: f2Err },
    { count: cubesCount = 0, error: cErr },
    { count: achievementsCount = 0, error: aErr },
  ] = await Promise.all([
    supabase
      .from("user_follows")
      .select("*", { head: true, count: "exact" })
      .eq("following_id", profile.user_id), // who follows THIS user
    supabase
      .from("user_follows")
      .select("*", { head: true, count: "exact" })
      .eq("follower_id", profile.user_id), // who THIS user follows
    supabase
      .from("user_cubes")
      .select("*", { head: true, count: "exact" })
      .eq("user_id", profile.user_id),
    supabase
      .from("user_achievements")
      .select("*", { head: true, count: "exact" })
      .eq("user_id", profile.user_id),
  ]);

  if (f1Err || f2Err || cErr || aErr) {
    throw error(500, "Failed to load profile stats");
  }

  // 3) Meta
  const origin = page.url.origin; // SSR-safe
  const canonical = `${origin}/user/${username}`;
  const ogImage = `${origin}/api/og/profile/${username}`;

  const description = buildProfileDescription(profile, {
    cubesCount: cubesCount ?? 0,
    achievementsCount: achievementsCount ?? 0,
    followersCount: followersCount ?? 0,
    followingCount: followingCount ?? 0,
  });

  // Avatar preload (Cloudinary fetch). If no avatar, you can point to a placeholder.
  const avatarSrc =
    profile.profile_picture ?? `${origin}/images/avatar-placeholder.png`; // change if you have a different placeholder

  const preloadImage = `https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_256,h_256,c_fill/${encodeURIComponent(
    avatarSrc
  )}`;

  return {
    profile,
    following,
    stats: { cubesCount, achievementsCount, followersCount, followingCount },
    meta: {
      title: `${profile.display_name || profile.username} (@${
        profile.username
      }) - CubeIndex`,
      description,
      canonical,
      ogImage,
      preloadImage,
    },
  };
}) satisfies LayoutLoad;
