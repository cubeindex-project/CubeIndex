import { supabase } from '$lib/supabaseClient';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const { data: badges, error } = await supabase
		.from('badges')
		.select('*')
		.order('name', { ascending: true });

	if (error) {
		console.error('Error fetching badges:', error.message);
		return {
			badges: []
		};
	}

	return {
		badges
	};
}
