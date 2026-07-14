/**
 * Strips tracking wrappers, unnests redirects, and optionally injects affiliate codes.
 * @param link Raw URL or string containing a URL
 * @returns Cleaned URL string
 */
export function cleanLink(link: string): string {
  const url = new URL(link);

  const clean = new URL(url.origin + url.pathname);

  if (
    url.host === "speedcubeshop.com" &&
    url.pathname.startsWith("/products/") &&
    url.searchParams.has("variant")
  ) {
    clean.searchParams.set("variant", url.searchParams.get("variant")!);
  }

  return clean.toString();
}
