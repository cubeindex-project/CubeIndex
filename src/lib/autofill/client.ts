import type { CubeDetailsAutofillResult, PriceAutofillResult } from "./types";

const fallbackErrorMessage = "We could not process that link right now.";
const connectionErrorMessage =
  "Something went wrong while contacting the autofill service.";

async function requestAutofill<Result>(
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
    throw new Error(connectionErrorMessage, { cause });
  }

  if (!response.ok) {
    throw new Error(
      "error" in result && result.error ? result.error : fallbackErrorMessage,
    );
  }

  return result as Result;
}

export function autofillCubeDetails(
  url: string,
): Promise<CubeDetailsAutofillResult> {
  return requestAutofill("cube-details", url);
}

export function autofillVendorOffer(url: string): Promise<PriceAutofillResult> {
  return requestAutofill("vendor-offer", url);
}
