import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async () => {
    redirect(308, 'https://discord.gg/76ExrEAE7s')
}) satisfies PageLoad;