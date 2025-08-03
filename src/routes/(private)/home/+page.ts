import type { PageLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

/**
 * Load data for the authenticated user's home page.
 */
export const load = (async ({ parent }) => {
  const { session, user } = await parent();
  if (!session) {
    throw redirect(303, "/");
  }
  return { user };
}) satisfies PageLoad;
