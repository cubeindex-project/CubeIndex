import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import type {
  CubeSurfaceFinishes,
  CubeVersionType,
} from "$lib/components/dbTableTypes";

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
    const message = "The provided link is not a valid URL.";
    return json({ error: message }, { status: 400 });
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return json(
      { error: "Only HTTP and HTTPS links are allowed." },
      { status: 400 },
    );
  }

  const payload = JSON.stringify({ id: crypto.randomUUID(), url: storeUrl });

  const request = await fetch("https://cubescraper.onrender.com/autofill", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: payload,
  });

  if (!request.ok) {
    const message = "Failed to fetch data from the server.";
    return json({ error: message }, { status: 500 });
  }

  const aufillData: AutofillResult = await request.json();

  return json(aufillData);
};
