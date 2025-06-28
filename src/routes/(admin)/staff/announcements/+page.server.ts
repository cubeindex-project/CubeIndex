import type { PageServerLoad, Actions } from './$types';
import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
    const { data: announcements, error: err } = await supabase
        .from('announcement')
        .select('*');

    if (err) error(500, err.message);

    const { data: profiles, error: profileErr } = await locals.supabase
        .from('profiles')
        .select('username, role')
        .eq('user_id', locals.user?.id)

    if (profileErr) error(500, { message: profileErr.message });

    const profile = profiles?.[0]

    return { announcements, profile };
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async ({ request, locals }) => {
        const formData = await request.formData()
        const title = formData.get('title') as string;
        const purpose = formData.get('purpose') as string;
        const message = formData.get('message') as string;
        const icon = formData.get('icon') as string;
        const link = formData.get('link') as string;
        const linkText = formData.get('linkText') as string;

        if (!title) return fail(400, { message: "A title is required!" });
        if (linkText && !link) return fail(400, { message: "Can't have a link text with no link!" })
        if (message.length > 100) return fail(400, { message: "The announcement message should be of 100 characters or less!" })

        const { data: profiles, error: err } = await locals.supabase
            .from('profiles')
            .select('username, role')
            .eq('user_id', locals.user?.id)

        if (err) return fail(500, { message: err.message });

        const profile = profiles?.[0]

        const { error: publishErr } = await locals.supabase
            .from('announcement')
            .insert([{
                title: title,
                purpose: purpose,
                message: message,
                icon: icon,
                link: link,
                linkText: linkText,
                archived: false,
                published_by: profile.username
            }])
            .select();

        if (publishErr?.message === "new row violates row-level security policy for table \"announcement\"") return fail(500, { message: `User ${profile.username} does not have sufficient permissions to create announcements. Only Community Managers are authorized and he is ${profile.role}.` });
        if (publishErr?.message === "duplicate key value violates unique constraint \"disclaimer_message_key\"") return fail(500, { message: `An announcement with this message has already been published, unarchive it or verify the content of your message.` });
        if (publishErr) return fail(500, { message: publishErr.message });

        return { message: "The Announcement was Published Successfully" }
    }
}