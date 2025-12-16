import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ fetch }) => {
  const res = await fetch("https://cubescraper.onrender.com/health", {
    headers: {
      "cache-control": "no-store",
    },
  });

  return new Response(null, {
    status: 204,
    headers: {
      "x-upstream-status": String(res.status),
    },
  });
};
