import { AUTOFILL_SERVICE_URL } from "$env/static/private";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ fetch, locals: { log } }) => {
  const res = await fetch(`${AUTOFILL_SERVICE_URL}/health`, {
    headers: {
      "cache-control": "no-store",
    },
  });

  log.debug({
    msg: "Autofill service status",
    status: res.status,
    statusText: res.statusText,
  });

  return new Response(null, {
    status: 204,
    headers: {
      "x-upstream-status": String(res.status),
    },
  });
};
