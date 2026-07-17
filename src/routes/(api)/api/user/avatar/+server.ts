// src/routes/api/user/avatar/+server.ts
import type { RequestHandler } from "./$types";
import { processImage, type ImageProfile } from "$lib/server/processImage";
import { StatusError } from "$lib/errors/StatusError";

function bad(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    const type = (form.get("type") as ImageProfile | null) ?? null;

    if (!file) return bad(400, "No file field found.");
    if (type !== "avatar" && type !== "banner") {
      return bad(400, "Invalid or missing type.");
    }

    const output = await processImage(file, type);

    return new Response(output.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    if (error instanceof StatusError) {
      return bad(error.status, error.message);
    }
    return bad(500, "Image processing failed.");
  }
};
