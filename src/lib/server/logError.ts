import { error } from "@sveltejs/kit";
import type { AppLogger } from "./logger";

/**
 * Logs an error using the shared server logger and rethrows it as a SvelteKit error.
 * @param errorCode HTTP status code to throw with the SvelteKit error.
 * @param errorMsg Optional human-readable message to log and throw.
 * @param log Request-scoped logger instance.
 * @param err The error or payload to be passed through the logger.
 * @param shouldThrow When false, logs without throwing.
 */
export function logError(
	errorCode: number,
	errorMsg: string | undefined,
	log: AppLogger,
	err: unknown
): never;
export function logError(
	errorCode: number,
	errorMsg: string | undefined,
	log: AppLogger,
	err: unknown,
	shouldThrow: false
): void;
export function logError(
	errorCode: number,
	errorMsg: string | undefined,
	log: AppLogger,
	err: unknown,
	shouldThrow: boolean = true
): void | never {
	const message = errorMsg ?? "An unexpected error occurred";
	log.error({ error: err }, message);
	if (shouldThrow) {
		throw error(errorCode, message);
	}
}
