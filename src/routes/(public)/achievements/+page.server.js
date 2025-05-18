import { supabase } from '$lib/supabaseClient';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const { data: achievements, error } = await supabase
		.from('achievements')
		.select('*')
		.order('name', { ascending: true });

	const { data: profiles, error: profilesError } = await supabase
		.from('profiles')
		.select('id, username');

	if (error) {
		console.error('Error fetching badges:', error.message);
		return {
			achievements: []
		};
	}

	if (profilesError) console.error('Error fetching badges:', profilesError.message);

	return {
		profiles,
		achievements
	}
}
