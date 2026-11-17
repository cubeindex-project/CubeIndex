import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
  PUBLIC_SUPABASE_URL: { public: true, static: true },
  PUBLIC_SUPABASE_PUBLISHABLE_KEY: { public: true, static: true },
  PUBLIC_UMAMI_DOMAINS: { public: true, static: true },
  PUBLIC_UMAMI_WEBSITE_ID: { public: true, static: true },
  TURNSTILE_SECRET_KEY: { static: true },
  PUBLIC_TURNSTILE_SITE_KEY: { public: true, static: true },
  AUTOFILL_SERVICE_URL: { static: true },
  GITHUB_APP_ID: { static: true },
  GITHUB_APP_INSTALLATION_ID: { static: true },
  GITHUB_APP_PRIVATE_KEY: { static: true },
  BREVO_API_KEY: { static: true },
  NODE_ENV: { static: true },
  LOG_LEVEL: { static: true },
  AXIOM_DATASET: { schema: (input) => input ?? "" },
  AXIOM_TOKEN: { schema: (input) => input ?? "" },
});
