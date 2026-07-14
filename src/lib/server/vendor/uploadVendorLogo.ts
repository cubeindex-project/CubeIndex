import { ImageProcessingError, processImage } from "$lib/server/processImage";
import type { NumericRange } from "@sveltejs/kit";

const vendorImagesBucket = "vendors-images";

/** The result of storing a processed vendor logo. */
export interface UploadedVendorLogo {
  logoPath: string;
  logoURL: string;
}

/** An error safe to display when a vendor logo cannot be stored. */
export class VendorLogoUploadError extends Error {
  constructor(
    readonly status: NumericRange<400, 599>,
    message: string,
  ) {
    super(message);
  }
}

/** Processes and uploads a vendor logo to Supabase Storage. */
export async function uploadVendorLogo(
  logo: File,
  userID: string,
  supabase: App.Locals["supabase"],
  log: App.Locals["log"],
): Promise<UploadedVendorLogo> {
  let processedLogo: Uint8Array;
  try {
    processedLogo = await processImage(logo, "vendor-logo");
  } catch (error) {
    if (error instanceof ImageProcessingError) {
      throw new VendorLogoUploadError(error.status, error.message);
    }

    log.error({ err: error }, "Failed to process vendor logo");
    throw new VendorLogoUploadError(500, "Unable to process the logo.");
  }

  const logoPath = `${userID}/${crypto.randomUUID()}.webp`;
  const bucket = supabase.storage.from(vendorImagesBucket);
  const { error: uploadError } = await bucket.upload(logoPath, processedLogo, {
    contentType: "image/webp",
    upsert: false,
  });

  if (uploadError) {
    log.error(
      { err: uploadError.message, logoPath },
      "Failed to upload vendor logo",
    );
    throw new VendorLogoUploadError(500, "Unable to upload the logo.");
  }

  const logoURL = bucket.getPublicUrl(logoPath).data.publicUrl;
  return { logoPath, logoURL };
}
