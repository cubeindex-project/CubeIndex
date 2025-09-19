// src/routes/api/user/avatar/+server.ts
import type { RequestHandler } from "./$types";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";

// Accepted input types (detected from *bytes*, not the filename)
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

// Max upload size per type (raw input bytes)
const MAX_BYTES = {
  avatar: 2 * 1024 * 1024, // 2 MB
  banner: 5 * 1024 * 1024, // 5 MB
} as const;

// Guard against decompression bombs
const MAX_INPUT_PIXELS = 40_000_000; // 40 MP

// Output sizes
const SIZES = {
  avatar: { width: 256, height: 256 },
  banner: { width: 1500, height: 500 },
} as const;

function bad(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Must be multipart/form-data
    const form = await request.formData();
    const file = form.get("file") as File | null;
    const type = (form.get("type") as "avatar" | "banner" | null) ?? null;

    if (!file) return bad(400, "No file field found.");
    if (!type || !(type in SIZES)) return bad(400, "Invalid or missing type.");

    // Basic size guard from the browser-provided metadata
    if (file.size === 0) return bad(400, "Empty file.");
    if (file.size > MAX_BYTES[type]) {
      return bad(
        413,
        `File too large. Max ${Math.round(MAX_BYTES[type] / 1024 / 1024)} MB.`
      );
    }

    // Read once, from the stream (don't call arrayBuffer() twice)
    const input = new Uint8Array(await file.arrayBuffer());

    // Detect actual MIME from magic bytes
    const ft = await fileTypeFromBuffer(input);
    const mime = ft?.mime ?? file.type; // fallback to browser-claimed type if detection fails

    if (!mime || !ALLOWED_MIME.has(mime)) {
      return bad(415, `Unsupported image type: ${mime || "unknown"}.`);
    }

    // Optional: probe width/height early for clearer errors
    // (sharp.metadata() may throw if bytes are corrupt)
    let width = 0,
      height = 0;
    try {
      const meta = await sharp(input, {
        limitInputPixels: MAX_INPUT_PIXELS,
      }).metadata();
      width = meta.width ?? 0;
      height = meta.height ?? 0;
      if (!width || !height)
        return bad(400, "Could not read image dimensions.");
      if (width * height > MAX_INPUT_PIXELS) {
        return bad(413, "Image too large (pixel count exceeds limit).");
      }
    } catch {
      // Typical sharp/libvips errors: corrupt data, unsupported container, etc.
      return bad(400, "Invalid or corrupted image data.");
    }

    // Normalize: crop-cover to target size and re-encode as WebP
    const { width: outW, height: outH } = SIZES[type];
    const out = await sharp(input, {
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
    })
      .resize(outW, outH, { fit: "cover", position: "attention" }) // "attention" centers on salient region
      .webp({ quality: 80 })
      .toBuffer();

    return new Response(Uint8Array.from(out), {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    // If this is running on an edge runtime, sharp will throw here.
    // Also catches any unexpected internal errors.
    const message =
      err instanceof Error ? err.message : "Unexpected server error.";
    return bad(500, `Processing failed: ${message}`);
  }
};
