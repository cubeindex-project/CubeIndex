import { env as privateEnv } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { pino, stdTimeFunctions, type LoggerOptions } from "pino";

const isProduction =
  (privateEnv.NODE_ENV ?? process.env.NODE_ENV ?? "").toLowerCase() ===
  "production";
const level =
  privateEnv.LOG_LEVEL?.toLowerCase() ?? (isProduction ? "info" : "debug");

const baseBindings: Record<string, string> = { app: "cubeindex" };
const currentEnv = privateEnv.NODE_ENV ?? process.env.NODE_ENV;
if (currentEnv) baseBindings.env = currentEnv;
if (publicEnv.PUBLIC_DEPLOYMENT_CHANNEL)
  baseBindings.deploymentChannel = publicEnv.PUBLIC_DEPLOYMENT_CHANNEL;

const options: LoggerOptions = {
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
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
};

export const logger = pino(options);
export type AppLogger = typeof logger;

export const createLogger = (bindings?: Record<string, unknown>) =>
  bindings ? logger.child(bindings) : logger;
