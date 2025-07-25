import type { Profiles } from "../types/profile";

export function idOfUser(profiles: Profiles[], user: string) {
  const profile = profiles?.find(
    (p: { username: string }) => p.username === user
  );
  return profile ? `/user/${profile.id}` : "#";
}
