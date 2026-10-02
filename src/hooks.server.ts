import { sequence } from "@sveltejs/kit/hooks";
import {
  error,
  type Handle,
  redirect,
  type HandleServerError,
} from "@sveltejs/kit";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_PUBLISHABLE_KEY,
} from "$env/static/public";
import { randomUUID } from "node:crypto";
import { createLogger } from "$lib/server/logger";

const context: Handle = async ({ event, resolve }) => {
  const reqId = randomUUID();
  const startedAt = performance.now();

  event.locals.reqId = reqId;
  event.setHeaders({ "x-request-id": reqId });

  const log = createLogger({
    reqId: event.locals.reqId,
    route: event.route.id,
    method: event.request.method,
    path: new URL(event.request.url).pathname,
  });
  event.locals.log = log;
  log.debug({ event: "http.request.started" }, "Request started");

  const response = await resolve(event);

  const durationMs = Math.round(performance.now() - startedAt);

  const fields = {
    event: "http.request.completed",
    status: response.status,
    durationMs,
  };

  if (response.status >= 500) {
    event.locals.log.error(fields, "Request completed with a server error");
  } else if (response.status >= 400) {
    event.locals.log.warn(fields, "Request completed with a client error");
  } else {
    event.locals.log.debug(fields, "Request completed");
  }

  return response;
};

const supabase: Handle = async ({ event, resolve }) => {
  /**
   * Creates a Supabase client specific to this server request.
   *
   * The Supabase client gets the Auth token from the request cookies.
   */
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return event.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
          headers?: Record<string, string>,
        ) {
          /**
           * Note: You have to add the `path` variable to the
           * set and remove method due to sveltekit's cookie API
           * requiring this to be set, setting the path to an empty string
           * will replicate previous/standard behavior (https://kit.svelte.dev/docs/types#public-types-cookies)
           */
          cookiesToSet.forEach(({ name, value, options }) =>
            event.cookies.set(name, value, { ...options, path: "/" }),
          );
          if (headers && Object.keys(headers).length > 0) {
            // Supabase sometimes sets multiple "Cache-Control" headers in one request. The try block makes it fail silently instead of giveing a 500 error
            try {
              event.setHeaders(headers);
            } catch (error) {
              event.locals.log.warn(
                {
                  err: error,
                },
                "An error occurred while setting header",
              );
            }
          }
        },
      },
    },
  );
  /**
   * Unlike `supabase.auth.getSession()`, which returns the session _without_
   * validating the JWT, this function also calls `getUser()` to validate the
   * JWT before returning the session.
   */
  event.locals.safeGetSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession();
    if (!session) {
      return { session: null, user: null };
    }
    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser();
    if (error) {
      // JWT validation has failed
      return { session: null, user: null };
    }
    return { session, user };
  };
  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      /**
       * Supabase libraries use the `content-range` and `x-supabase-api-version`
       * headers, so we need to tell SvelteKit to pass it through.
       */
      return name === "content-range" || name === "x-supabase-api-version";
    },
  });
};

const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  if (user) {
    event.locals.log = event.locals.log.child({
      actorUserId: user.id,
    });
  }

  if (!user) {
    if (event.url.pathname.startsWith("/staff")) {
      redirect(303, "/auth/login");
    }

    if (event.url.pathname.includes("/notifications")) {
      redirect(303, "/auth/login");
    }

    if (event.url.pathname.startsWith("/userbar")) {
      redirect(303, "/auth/login");
    }

    if (event.url.pathname.includes("/settings")) {
      redirect(303, "/auth/login");
    }

    return resolve(event);
  }

  const { data: profile, error: err } = await event.locals.supabase
    .from("profiles")
    .select("id, username, role, onboarded")
    .eq("user_id", user.id)
    .maybeSingle();

  if (err) {
    event.locals.log.error(
      {
        event: "auth.profile.load_failed",
        err,
      },
      "An error occurred while fetching your profile",
    );
    throw error(500, "An error occurred while fetching your profile");
  }

  if (
    (!profile || !profile.onboarded) &&
    !event.url.pathname.startsWith("/auth/complete-profile") &&
    !event.url.pathname.startsWith("/auth/logout") &&
    !event.url.pathname.startsWith("/auth/callback") &&
    !event.url.pathname.startsWith("/auth/confirm")
  ) {
    redirect(303, "/auth/complete-profile");
  }

  if (event.url.pathname === "/auth") {
    redirect(303, `/user/${profile?.id}`);
  }
  // Logged-in users landing on the marketing homepage should see their dashboard instead
  if (event.url.pathname === "/") {
    redirect(303, "/dashboard");
  }
  if (event.url.pathname.startsWith("/staff") && profile?.role === "User") {
    redirect(303, "/");
  }

  return resolve(event);
};

export const handle: Handle = sequence(context, supabase, authGuard);

const errorMessages: Record<number, string> = {
  400: "The request could not be understood.",
  401: "You need to sign in to continue.",
  403: "You do not have permission to access this resource.",
  404: "This page does not exist.",
  405: "This request method is not allowed.",
  408: "The request timed out. Please try again.",
  409: "The request conflicts with the current state of this resource.",
  422: "The submitted data could not be processed.",
  429: "Too many requests. Please try again later.",
  500: "Something went wrong on our end.",
  501: "This feature is not implemented.",
  502: "The server received an invalid response.",
  503: "The service is temporarily unavailable. Please try again later.",
  504: "The server took too long to respond. Please try again later.",
};

export const handleError: HandleServerError = ({
  error: err,
  event,
  status,
}) => {
  const log = event.locals.log;
  const errorToLog = err instanceof Error ? err : new Error(String(err));
  log.error(
    { event: "http.request.unhandled_error", err: errorToLog, status },
    "Unhandled error",
  );
  return {
    message: errorMessages[status] ?? "Something went wrong",
    reqId: event.locals.reqId,
  };
};
