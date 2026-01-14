import { browser } from "$app/environment";
import { getLocale, setLocale } from "$lib/paraglide/runtime";
import { writable } from "svelte/store";

export const supportedLocales = ["en", "fr"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const LOCALE_COOKIE_NAME = "locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const localeStore = writable<SupportedLocale>(getLocale() as SupportedLocale);

/**
 * Normalize a locale string to one of the supported locales.
 */
export function normalizeLocale(value?: string | null): SupportedLocale | null {
	if (!value) {
		return null;
	}

	const lowered = value.toLowerCase();
	if (supportedLocales.includes(lowered as SupportedLocale)) {
		return lowered as SupportedLocale;
	}

	const baseLocale = lowered.split("-")[0];
	return supportedLocales.includes(baseLocale as SupportedLocale)
		? (baseLocale as SupportedLocale)
		: null;
}

/**
 * Determine the best locale from cookie and Accept-Language header values.
 */
export function resolveLocale(options: {
	cookie?: string | null;
	header?: string | null;
}): SupportedLocale {
	const cookieLocale = normalizeLocale(options.cookie);
	if (cookieLocale) {
		return cookieLocale;
	}

	if (options.header) {
		const ranges = options.header.split(",").map((range) =>
			range.trim().split(";")[0]
		);
		for (const range of ranges) {
			const headerLocale = normalizeLocale(range);
			if (headerLocale) {
				return headerLocale;
			}
		}
	}

	return "en";
}

/**
 * Set the active locale and persist it in the browser.
 */
export function setAppLocale(locale: SupportedLocale): void {
	setLocale(locale);
	localeStore.set(locale);

	if (browser) {
		document.documentElement.lang = locale;
		document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
	}
}

export const locale = {
	subscribe: localeStore.subscribe,
};
