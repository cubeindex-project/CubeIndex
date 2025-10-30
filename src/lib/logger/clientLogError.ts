import { error } from "@sveltejs/kit";
import type { BrowserLogger } from "./client";

/**
 * Logs an error using the browser/logger shared helper and rethrows a generic error.
 * @param errorMsg Optional human-readable message to log and throw.
 * @param log Browser logger instance.
 * @param err The error or payload to be logged.
 * @param shouldThrow When false, logs without throwing.
 * @param statusCode Optional HTTP status code for SvelteKit's `error` helper.
 */
export function clientLogError(
	errorMsg: string | undefined,
	log: BrowserLogger,
	err: unknown
): never;
export function clientLogError(
	errorMsg: string | undefined,
	log: BrowserLogger,
	err: unknown,
	shouldThrow: false,
	statusCode?: number
): void;
export function clientLogError(
	errorMsg: string | undefined,
	log: BrowserLogger,
	err: unknown,
	shouldThrow: boolean = true,
	statusCode?: number
): void | never {
	const message = errorMsg ?? "An unexpected error occurred";
	log.error({ error: err }, message);
	if (!shouldThrow) return;
	if (typeof statusCode === "number") {
		throw error(statusCode, message);
	}
	throw new Error(message);
}
