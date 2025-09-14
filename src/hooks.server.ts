import { sequence } from "@sveltejs/kit/hooks";
import { type Handle, redirect, error } from "@sveltejs/kit";
import { createServerClient } from "@supabase/ssr";
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
} from "$env/static/public";

const supabase: Handle = async ({ event, resolve }) => {
  /**
   * Creates a Supabase client specific to this server request.
   *
   * The Supabase client gets the Auth token from the request cookies.
   */
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        /**
         * SvelteKit's cookies API requires `path` to be explicitly set in
         * the cookie options. Setting `path` to `/` replicates previous/
         * standard behavior.
         */
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: "/" });
          });
        },
      },
    }
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

  const { data: profiles, error: err } = await event.locals.supabase
    .from("profiles")
    .select("id, username, role")
    .eq("user_id", user?.id);

  if (err) throw error(500, err.message);

  const profile = profiles?.[0];

  if (event.url.pathname === "/auth") {
    redirect(303, `/user/${profile?.id}`);
  }
  // Logged-in users landing on the marketing homepage should see their dashboard instead
  if (event.url.pathname === "/") {
    redirect(303, "/dashboard");
  }
  if (event.url.pathname.startsWith("/staff") && profile.role === "User") {
    redirect(303, "/");
  }

  return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
