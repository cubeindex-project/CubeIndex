import type { PageServerLoad } from "./$types";

export const load = (async ({ locals: { user } }) => {
  return { user };
}) satisfies PageServerLoad;
