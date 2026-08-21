import { AUTOFILL_SERVICE_URL } from "$env/static/private";
import { json, type RequestHandler } from "@sveltejs/kit";

type ScrapingCapability =
  "supports_product_scraping" | "supports_price_scraping";

interface AutofillHandlerOptions {
  endpoint: string;
  supportedVendorsCapability: ScrapingCapability;
}

const normalizeHost = (host: string): string =>
  host.toLowerCase().replace(/^www\./, "");

export function createAutofillHandler<Result>({
  endpoint,
  supportedVendorsCapability,
}: AutofillHandlerOptions): RequestHandler {
  return async ({ request, locals: { user, session, supabase, log } }) => {
    if (!user || !session) {
      return json(
        { error: "You must be logged in to use this feature." },
        { status: 401 },
      );
    }

    const { productURL } = await request.json();

    if (!productURL) {
      return json(
        { error: "Provide a product link to continue." },
        { status: 400 },
      );
    }

    let parsedURL: URL;

    try {
      parsedURL = new URL(productURL);
    } catch {
      return json(
        { error: "The provided link is not a valid URL." },
        { status: 400 },
      );
    }

    if (!["http:", "https:"].includes(parsedURL.protocol)) {
      return json(
        { error: "Only HTTP and HTTPS links are allowed." },
        { status: 400 },
      );
    }

    const { data: supportedStores, error } = await supabase
      .from("vendors")
      .select("name, base_url")
      .eq(supportedVendorsCapability, true);

    if (error) {
      log.error({ err: error }, "Failed to fetch supported stores");
      return json(
        { error: "Failed to fetch supported stores from database." },
        { status: 500 },
      );
    }

    const productHost = normalizeHost(parsedURL.hostname);
    const supported = supportedStores.some(({ base_url: baseURL }) => {
      const vendorHost = normalizeHost(new URL(baseURL).hostname);
      return (
        productHost === vendorHost || productHost.endsWith(`.${vendorHost}`)
      );
    });

    if (!supported) {
      return json(
        {
          error: `This store is not yet supported. Supported stores are: ${supportedStores
            .map(({ name }) => name)
            .join(", ")}`,
        },
        { status: 400 },
      );
    }

    const jobID = crypto.randomUUID();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);

    let response: Response;

    try {
      response = await fetch(`${AUTOFILL_SERVICE_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: jobID,
          url: parsedURL.toString(),
        }),
        signal: controller.signal,
      });
    } catch {
      return json(
        { error: "Autofill service is unreachable." },
        { status: 502 },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const upstreamResult = (await response.json().catch(() => null)) as {
        detail?: string;
      } | null;

      log.error(
        {
          err: {
            jobID,
            errorMessage: upstreamResult?.detail,
          },
        },
        "Autofill job execution failed",
      );

      return json(
        {
          error:
            upstreamResult?.detail ??
            "Failed to fetch data from the autofill service.",
        },
        { status: response.status },
      );
    }

    try {
      return json((await response.json()) as Result);
    } catch {
      return json(
        { error: "Autofill service returned invalid JSON." },
        { status: 502 },
      );
    }
  };
}
