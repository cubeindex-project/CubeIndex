export async function cleanUpVendorLogo(
  logoPath: string,
  supabase: App.Locals["supabase"],
  log: App.Locals["log"],
) {
  const { error: cleanupError } = await supabase.storage
    .from("vendors-images")
    .remove([logoPath]);
  if (cleanupError) {
    log.error(
      { err: cleanupError.message, logoPath },
      "Failed to clean up vendor logo",
    );
  }
}
