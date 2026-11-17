import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { trackServerEvent } from "#lib/server/umami.ts";

export const GET: RequestHandler = async () => {
  await trackServerEvent("staff-application-visited");
  redirect(308, "https://tally.so/r/w7gbd9", { external: true });
};
