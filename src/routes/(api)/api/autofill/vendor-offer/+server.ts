import { createAutofillHandler } from "#lib/server/autofill/createAutofillHandler.ts";
import type { VendorOfferAutofillResult } from "#lib/types/autofill.types.ts";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler =
  createAutofillHandler<VendorOfferAutofillResult>({
    endpoint: "vendor-offer/autofill",
    supportedVendorsCapability: "supports_price_scraping",
  });
