import { StatusError } from "$lib/errors/StatusError";
import { processImage } from "$lib/server/processImage";

const vendorImagesBucket = "vendors-images";

/** The result of storing a processed vendor logo. */
export interface UploadedVendorLogo {
  logoPath: string;
  logoURL: string;
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
    if (error instanceof StatusError) {
      throw error;
    }

    log.error({ err: error }, "Failed to process vendor logo");
    throw new StatusError(500, "Unable to process the logo.");
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
    throw new StatusError(500, "Unable to upload the logo.");
  }

  const logoURL = bucket.getPublicUrl(logoPath).data.publicUrl;
  return { logoPath, logoURL };
}
