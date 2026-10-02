import { NODE_ENV, LOG_LEVEL } from "$env/static/private";
import { env } from "$env/dynamic/private";
import pino, { stdTimeFunctions, type LoggerOptions } from "pino";

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
    paths: ["*.token", "*.password", "req.headers.authorization"],
    remove: true,
  },
};

const options: LoggerOptions = isProduction
  ? {
      ...baseOptions,
      transport: {
        target: "@axiomhq/pino",
        options: {
          dataset: env.AXIOM_DATASET,
          token: env.AXIOM_TOKEN,
          edge: "us-east-1.aws.edge.axiom.co",
        },
      },
    }
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
