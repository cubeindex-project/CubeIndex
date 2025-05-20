import * as configcat from "configcat-js-ssr";

const logger = configcat.createConsoleLogger(configcat.LogLevel.Info); // Set the log level to INFO to track how your feature flags were evaluated. When moving to production, you can remove this line to avoid too detailed logging.

export const configCatClient = configcat.getClient("configcat-sdk-1/8pXdCLCpSEWNeXwZwxKZ2g/Gkcuy5S8sEGNwyOqLhmb7Q", // <-- This is the actual SDK Key for your Test Environment environment
    configcat.PollingMode.AutoPoll,
    {
        logger: logger
    });