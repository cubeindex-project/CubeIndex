import { createAutofillHandler } from "$lib/server/autofill/createAutofillHandler";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = createAutofillHandler({
  endpoint: "vendor-offer/autofill",
  capability: "supports_price_scraping",
});
