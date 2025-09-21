import { browser } from '$app/environment';
import pino, { type LoggerOptions } from 'pino';

const level =
	(typeof import.meta.env.PUBLIC_LOG_LEVEL === 'string' && import.meta.env.PUBLIC_LOG_LEVEL.length > 0)
		? import.meta.env.PUBLIC_LOG_LEVEL
		: import.meta.env.DEV
			? 'debug'
			: 'info';

const options: LoggerOptions = {
	level,
	base: {
		app: 'cubeindex',
		runtime: browser ? 'browser' : 'ssr',
		mode: import.meta.env.MODE,
	},
	browser: {
		asObject: true,
	},
	messageKey: 'message',
	errorKey: 'error',
};

export const clientLogger = pino(options);
export type BrowserLogger = typeof clientLogger;

export const getClientLogger = (bindings?: Record<string, unknown>) =>
	bindings ? clientLogger.child(bindings) : clientLogger;
