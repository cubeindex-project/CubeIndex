import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { RequestEvent } from '@sveltejs/kit';

export const supabase = (event: RequestEvent) =>
  createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      /* read every cookie that came with the request */
      getAll: () => event.cookies.getAll(),

      /* write *all* Set-Cookie headers back, patching `path` as SvelteKit requires */
      setAll: (cookiesToSet) =>
        cookiesToSet.forEach(({ name, value, options }) =>
          event.cookies.set(name, value, { ...options, path: '/' })
        )
    }
  });