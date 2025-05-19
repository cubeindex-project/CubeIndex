import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
    const { user } = await locals.safeGetSession();

    const { data: profiles, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq("user_id", user?.id);

    if (err) throw error(500, err.message);
    return { profiles };
}) satisfies PageServerLoad;

/** @satisfies {Actions} */
export const actions: Actions = {
  default: async ({ request, locals }) => {
    // 1) Parse form data
    const form = await request.formData();
    const profile_picture = form.get('profile_picture')?.toString() ?? '';
    const banner = form.get('banner')?.toString() ?? '';
    const username = form.get('username')?.toString() ?? '';
    const bio = form.get('bio')?.toString() ?? '';
    const is_private = form.get('private_profile') === 'on';
    const socials = {
      website: form.get('website')?.toString() ?? '',
      x: form.get('x')?.toString() ?? '',
      wca: form.get('wca')?.toString() ?? '',
      discord: form.get('discord')?.toString() ?? '',
      youtube: form.get('youtube')?.toString() ?? '',
      reddit: form.get('reddit')?.toString() ?? ''
    };

    // 2) Get current user ID from locals.session
    const user = locals.session?.user;
    const client = locals.supabase
    if (!user) {
      return fail(401, { message: 'Not authenticated' });
    }

    // 3) Update the profile row
    const { error } = await client
      .from('profiles')
      .update({
        profile_picture,
        banner,
        username,
        bio,
        private: is_private,
        socials
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      return fail(500, { message: error.message });
    }

    // 4) Success: redirect back or return success data
    return { success: true };
  }
};
