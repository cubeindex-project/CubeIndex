import type {
  CubeDetailsAutofillResult,
  VendorOfferAutofillResult,
} from "$lib/types/autofill.types";

async function sendAutofillRequest(endpoint: string, url: string) {
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
    const message =
      result?.error || "We could not process that link right now.";
    throw new Error(message);
  }

  return result;
}

export function fetchCubeDetailsAutofill(
  url: string,
): Promise<CubeDetailsAutofillResult> {
  return sendAutofillRequest("cube-details", url);
}

export function fetchVendorOfferAutofill(
  url: string,
): Promise<VendorOfferAutofillResult> {
  return sendAutofillRequest("vendor-offer", url);
}
