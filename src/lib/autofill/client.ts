import type { CubeDetailsAutofillResult, PriceAutofillResult } from "./types";

async function sendAutofillRequest<Result>(
  endpoint: string,
  url: string,
): Promise<Result> {
  let response: Response;
  let result;

  try {
    response = await fetch(`/api/autofill/${endpoint}`, {
      method: "POST",
      body: JSON.stringify({
        productURL: url,
      }),
    });

    result = await response.json();
  } catch (cause) {
    throw new Error(
      "Something went wrong while contacting the autofill service.",
      { cause },
    );
  }

  if (!response.ok) {
    throw new Error(
      "error" in result && result.error
        ? result.error
        : "We could not process that link right now.",
    );
  }

  return result as Result;
}

export function autofillCubeDetails(
  url: string,
): Promise<CubeDetailsAutofillResult> {
  return sendAutofillRequest("cube-details", url);
}

export function autofillVendorOffer(url: string): Promise<PriceAutofillResult> {
  return sendAutofillRequest("vendor-offer", url);
}
