import { json } from "@sveltejs/kit";
import { clientErrorSchema } from "$lib/schemas/clientError";
import { getZodErrorMessage } from "$lib/utils/getZodErrorMessage";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals: { log } }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsedPayload = clientErrorSchema.safeParse(body);
  if (!parsedPayload.success) {
    return json(
      { error: getZodErrorMessage(parsedPayload.error) },
      { status: 400 },
    );
  }

  const { error, status, url } = parsedPayload.data;
  const path = new URL(url).pathname;
  log.error(
    { event: "client.unhandled_error", clientError: error, status, path },
    "Unhandled client error",
  );

  return new Response(null, { status: 204 });
};
