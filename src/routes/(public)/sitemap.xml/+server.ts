import { statSync } from "node:fs";
import type { RequestHandler } from "./$types";

/**
 * A single URL entry in the sitemap.
 */
interface SitemapEntry {
  loc: string;
  lastmod: string;
}

/**
 * Build the list of sitemap entries by scanning public routes.
 */
function buildEntries(url: URL): SitemapEntry[] {
  const files = import.meta.glob("../**/**/+page.{svelte,ts}");
  const pages = new Map<string, Date>();

  for (const file of Object.keys(files)) {
    if (file.includes("[")) continue;
    if (file.includes("(admin)")) continue;

    const fileURL = new URL(file, import.meta.url);
    let mtime: Date;
    try {
      mtime = statSync(fileURL).mtime;
    } catch {
      mtime = new Date();
    }

    const path =
      file
        .replace("/(public)", "")
        .replace("/(private)", "")
        .replace("/(auth)", "")
        .replace(/\/\+page\.(svelte|ts)$/u, "") || "/";
    const existing = pages.get(path);
    if (!existing || mtime > existing) pages.set(path, mtime);
  }

  return Array.from(pages.entries()).map(([path, time]) => ({
    loc: new URL(path === "/" ? "" : path.slice(1), url.origin).toString(),
    lastmod: time.toISOString(),
  }));
}

/**
 * Render the sitemap XML.
 */
function renderXML(entries: SitemapEntry[]): string {
  const urls = entries
    .map((e) => `<url><loc>${e.loc}</loc><lastmod>${e.lastmod}</lastmod></url>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export const GET: RequestHandler = async ({url}) => {
  const body = renderXML(buildEntries(url));
  return new Response(body, {
    headers: { "Content-Type": "application/xml" },
  });
};
