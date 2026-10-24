import { NODE_ENV, LOG_LEVEL } from "$env/static/private";
import { env } from "$env/dynamic/private";
import pino, { stdTimeFunctions, type LoggerOptions } from "pino";
import axiomTransport from "@axiomhq/pino";
import pretty from "pino-pretty";

const isProduction = NODE_ENV.toLowerCase() === "production";

const level = LOG_LEVEL.toLowerCase();

if (isProduction && (!env.AXIOM_DATASET || !env.AXIOM_TOKEN)) {
  throw new Error(
    "AXIOM_DATASET and AXIOM_TOKEN must be configured in production.",
  );
}

const baseBindings: Record<string, string> = { app: "cubeindex" };
const currentEnv = NODE_ENV;
if (currentEnv) baseBindings.env = currentEnv;

const baseOptions: LoggerOptions = {
  level,
  base: baseBindings,
  timestamp: stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  errorKey: "err",
  messageKey: "msg",
  redact: {
    paths: [
      "*.token",
      "*.access_token",
      "*.refresh_token",
      "*.password",
      "*.authorization",
      "*.cookie",
      "req.headers.authorization",
      "req.headers.cookie",
    ],
    remove: true,
  },
};

export const logger = isProduction
  ? pino(
      baseOptions,
      await axiomTransport({
        dataset: process.env.AXIOM_DATASET!,
        token: process.env.AXIOM_TOKEN!,
      }),
    )
  : pino(
      baseOptions,
      pretty({
        levelFirst: true,
        colorize: true,
        ignore: "time,hostname,pid",
      }),
    );

export const createLogger = (bindings?: Record<string, unknown>) =>
  bindings ? logger.child(bindings) : logger;
