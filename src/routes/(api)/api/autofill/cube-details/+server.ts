import { createAutofillHandler } from "$lib/server/autofill/createAutofillHandler";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = createAutofillHandler({
  endpoint: "cube-details/autofill",
  capability: "supports_product_scraping",
});
