import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  redirect(308, "https://tally.so/r/w7gbd9");
};
