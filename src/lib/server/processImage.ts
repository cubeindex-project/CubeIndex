import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

const allowedMIMETypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const maxInputPixels = 40_000_000;

const imageProfiles = {
  avatar: {
    maxBytes: 2 * 1024 * 1024,
    width: 256,
    height: 256,
    fit: "cover",
  },
  banner: {
    maxBytes: 5 * 1024 * 1024,
    width: 1500,
    height: 500,
    fit: "cover",
  },
  "vendor-logo": {
    maxBytes: 512 * 1024,
    width: 512,
    height: 512,
    fit: "contain",
  },
} as const;

export type ImageProfile = keyof typeof imageProfiles;

export class ImageProcessingError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Validates and normalizes an uploaded image to WebP. */
export async function processImage(
  file: File,
  profileName: ImageProfile,
): Promise<Uint8Array> {
  const profile = imageProfiles[profileName];

  if (file.size === 0) {
    throw new ImageProcessingError(400, "Empty file.");
  }
  if (file.size > profile.maxBytes) {
    throw new ImageProcessingError(
      413,
      `File too large. Max ${Math.round(profile.maxBytes / 1024)} KB.`,
    );
  }

  const input = new Uint8Array(await file.arrayBuffer());
  const detectedType = await fileTypeFromBuffer(input);
  if (!detectedType || !allowedMIMETypes.has(detectedType.mime)) {
    throw new ImageProcessingError(415, "Unsupported image type.");
  }

  try {
    const metadata = await sharp(input, {
      limitInputPixels: maxInputPixels,
    }).metadata();
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;

    if (!width || !height) {
      throw new ImageProcessingError(400, "Could not read image dimensions.");
    }
    if (width * height > maxInputPixels) {
      throw new ImageProcessingError(
        413,
        "Image pixel count exceeds the limit.",
      );
    }

    return Uint8Array.from(
      await sharp(input, {
        failOn: "error",
        limitInputPixels: maxInputPixels,
      })
        .resize(profile.width, profile.height, {
          fit: profile.fit,
          position: "attention",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .webp({ quality: 80 })
        .toBuffer(),
    );
  } catch (error) {
    if (error instanceof ImageProcessingError) throw error;
    throw new ImageProcessingError(400, "Invalid or corrupted image data.");
  }
}
