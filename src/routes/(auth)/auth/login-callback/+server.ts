import { redirect, error } from '@sveltejs/kit';

export const GET = async ({ url, locals: { supabase } }) => {
    const code = url.searchParams.get('code') as string;
    const next = url.searchParams.get('next') ?? '/';

    if (code) {
        const { error: err } = await supabase.auth.exchangeCodeForSession(code)
        if (!err) {
            throw redirect(303, `/${next.slice(1)}`);
        }
        throw error(500, err.message);
    }
    throw error(500, 'Authorization code is missing.');
};