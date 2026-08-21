import { createAutofillHandler } from "$lib/server/autofill/createAutofillHandler";
import type { VendorOfferAutofillResult } from "$lib/types/autofill.types";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler =
  createAutofillHandler<VendorOfferAutofillResult>({
    endpoint: "vendor-offer/autofill",
    supportedVendorsCapability: "supports_price_scraping",
  });
