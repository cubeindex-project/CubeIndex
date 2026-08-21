import { createAutofillHandler } from "$lib/server/autofill/createAutofillHandler";
import type { CubeDetailsAutofillResult } from "$lib/types/autofill.types";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler =
  createAutofillHandler<CubeDetailsAutofillResult>({
    endpoint: "cube-details/autofill",
    supportedVendorsCapability: "supports_product_scraping",
  });
