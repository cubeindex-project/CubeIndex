import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import type {
  CubeSurfaceFinishes,
  CubeVersionType,
} from "$lib/components/dbTableTypes";
import { AUTOFILL_SERVICE_URL } from "$env/static/private";

export interface AutofillResult {
  brand?: string;
  image_url?: string;
  type?: string;
  discontinued?: boolean;
  release_date?: string;
  weight?: number;
  version_type?: CubeVersionType;
  surface_finish?: CubeSurfaceFinishes;
  size?: string;
  magnetic?: boolean;
  maglev?: boolean;
  smart?: boolean;
  stickered?: boolean;
  wca_legal?: boolean;
  modded?: boolean;
  ball_core?: boolean;
}

const SUPPORTED_STORES = new Set(["thecubicle.com", "speedcubeshop.com"]);

function normalizeHost(host: string) {
  return host.toLowerCase().replace(/^www\./, "");
}

export const GET: RequestHandler = async ({
  url,
  locals: { safeGetSession },
}) => {
  const { session } = await safeGetSession();
  if (!session) {
    return json(
      { error: "You must be logged in to use this feature." },
      { status: 401 },
    );
  }

  const storeUrl = url.searchParams.get("url");
  if (!storeUrl) {
    return json(
      { error: "Provide a product link to continue." },
      { status: 400 },
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(storeUrl);
  } catch {
    return json(
      { error: "The provided link is not a valid URL." },
      { status: 400 },
    );
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return json(
      { error: "Only HTTP and HTTPS links are allowed." },
      { status: 400 },
    );
  }

  const host = normalizeHost(parsedUrl.hostname);
  if (!SUPPORTED_STORES.has(host)) {
    return json(
      {
        error:
          "This store is not yet supported. Supported stores are: " +
          Array.from(SUPPORTED_STORES).join(", "),
      },
      { status: 400 },
    );
  }

  const payload = JSON.stringify({
    id: crypto.randomUUID(),
    url: parsedUrl.toString(),
  });

  // Timeout protection
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  let res: Response;
  try {
    res = await fetch(AUTOFILL_SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: payload,
      signal: controller.signal,
    });
  } catch {
    clearTimeout(timeout);
    return json({ error: "Autofill service is unreachable." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    // Try to forward a useful message from the upstream service
    const upstreamText = await res.text().catch(() => "");
    return json(
      {
        error:
          upstreamText || "Failed to fetch data from the autofill service.",
      },
      { status: res.status },
    );
  }

  let autofillData: AutofillResult;
  try {
    autofillData = (await res.json()) as AutofillResult;
  } catch {
    return json(
      { error: "Autofill service returned invalid JSON." },
      { status: 502 },
    );
  }

  return json(autofillData);
};
