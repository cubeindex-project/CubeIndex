import type { Profiles } from "../types/profile";
import { supabase } from "$lib/supabaseClient";

let profiles: Profiles[] = [];

const { data, error: psErr } = await supabase
  .from("profiles")
  .select("id, username");

if (psErr) {
  console.error(500, `Failed to fetch profiles: ${psErr.message}`);
}

profiles = data as Profiles[];

export function idOfUser(user: string) {
  const profile = profiles?.find(
    (p: { username: string }) => p.username === user
  );
  return profile ? `/user/${profile.id}` : "#";
}
