import { NODE_ENV, LOG_LEVEL } from "$env/static/private";
import { PUBLIC_DEPLOYMENT_CHANNEL } from "$env/static/public";
import { pino, stdTimeFunctions, type LoggerOptions } from "pino";

const isProduction =
  (NODE_ENV ?? process.env.NODE_ENV ?? "").toLowerCase() === "production";

const level = LOG_LEVEL?.toLowerCase() ?? (isProduction ? "info" : "debug");

const baseBindings: Record<string, string> = { app: "cubeindex" };
const currentEnv = NODE_ENV ?? process.env.NODE_ENV;
if (currentEnv) baseBindings.env = currentEnv;
if (PUBLIC_DEPLOYMENT_CHANNEL)
  baseBindings.deploymentChannel = PUBLIC_DEPLOYMENT_CHANNEL;

// Base options shared in all envs
const baseOptions: LoggerOptions = {
  level,
  base: baseBindings,
  timestamp: stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  errorKey: "error",
  messageKey: "message",
  redact: {
    paths: ["*.token", "*.password", "req.headers.authorization"],
    remove: true,
  },
};

// Only attach pretty transport outside production
const options: LoggerOptions = isProduction
  ? baseOptions
  : {
    ...baseOptions,
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
      },
    },
  };

export const logger = pino(options);
export type AppLogger = typeof logger;

export const createLogger = (bindings?: Record<string, unknown>) =>
	bindings ? logger.child(bindings) : logger;
