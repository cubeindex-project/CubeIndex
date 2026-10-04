import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { trackServerEvent } from "$lib/server/umami";

export const GET: RequestHandler = async () => {
  await trackServerEvent("discord-invite-visited");
  redirect(308, "https://discord.gg/76ExrEAE7s");
};
