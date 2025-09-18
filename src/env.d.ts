declare module "$env/static/public" {
  export const PUBLIC_DEPLOYMENT_CHANNEL: string;
  export const PUBLIC_SITE_URL: string;
  export const PUBLIC_TURNSTILE_SITE_KEY: string;
  export const PUBLIC_SUPABASE_URL: string;
  export const PUBLIC_SUPABASE_ANON_KEY: string;
}

declare module "$env/static/private" {
  export const TURNSTILE_SECRET_KEY: string;
}

declare module "virtual:pwa-register/svelte" {
  interface RegisterSWOptions {
    immediate?: boolean;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: unknown) => void;
  }

  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: import("svelte/store").Writable<boolean>;
    offlineReady: import("svelte/store").Writable<boolean>;
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}
