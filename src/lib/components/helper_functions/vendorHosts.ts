/**
 * Normalize hostnames from vendor base URLs or image links.
 * Strips protocols and common prefixes while guarding against invalid inputs.
 */
export function normalizeHostname(value: string | null): string | null {
	const candidate = value?.trim();
	if (!candidate) return null;

	const normalized = candidate.includes("://")
		? candidate
		: `https://${candidate}`;

	try {
		const hostname = new URL(normalized).hostname.toLowerCase();
		return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
	} catch {
		return null;
	}
}

/**
 * Extract unique hostnames from a list of vendor base URLs.
 */
export function extractVendorHostnames(
	vendors: Array<{ base_url: string | null }>,
): string[] {
	const hostnames = new Set<string>();

	for (const vendor of vendors) {
		const hostname = normalizeHostname(vendor.base_url);
		if (hostname) {
			hostnames.add(hostname);
		}
	}

	return Array.from(hostnames);
}
