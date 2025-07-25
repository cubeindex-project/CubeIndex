/**
 * Strips tracking wrappers, unnests redirects, and optionally injects affiliate codes.
 * @param link Raw URL or string containing a URL
 * @param opts
 * @returns Cleaned URL string
 */
export function cleanLink(
  link: string,
): string {
  let url: URL;

  // 1) Parse or extract URL
  try {
    url = new URL(link);
  } catch (err) {
    if (err instanceof TypeError) {
      const match = link.match(/https?:\/\/\S+/);
      if (match) {
        url = new URL(match[0]);
      } else {
        console.warn('cleanLink: no valid URL found in:', link);
        return link;
      }
    } else {
      throw err;
    }
  }

  // 2) Unwrap known redirectors
  const { host, pathname, searchParams } = url;
  if (host === 'l.facebook.com' && searchParams.has('u')) {
    url = new URL(decodeURIComponent(searchParams.get('u')!));
  } else if (host === 'href.li') {
    const qs = url.href.split('?')[1] ?? '';
    url = new URL(qs);
  } else if (
    host === 'www.google.com' &&
    pathname === '/url' &&
    searchParams.has('url')
  ) {
    url = new URL(searchParams.get('url')!);
  } else if (host === 'cts.businesswire.com' && searchParams.has('url')) {
    url = new URL(searchParams.get('url')!);
  }

  // Start building the cleaned URL
  const clean = new URL(url.origin + url.pathname);

  // 3) Preserve safe parameters
  const keepParams: Record<string, boolean> = {
    q: true,
    id: host.includes('play.google.com') && searchParams.has('id'),
    ID: host.includes('macys.com') && searchParams.has('ID')
  };
  for (const [key, keep] of Object.entries(keepParams)) {
    if (keep && searchParams.has(key)) {
      clean.searchParams.set(key, searchParams.get(key)!);
    }
  }

  return clean.toString();
}
