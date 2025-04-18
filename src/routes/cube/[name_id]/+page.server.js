// src/routes/cube/[id]/+page.server.js
import { supabase } from '$lib/supabaseClient';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const { name_id } = params;

	const { data: cube, error } = await supabase
		.from('cubes')
		.select('*')
		.eq('name_id', name_id)
		.single();

	if (error || !cube) {
		console.error(error);
		return { status: 404 };
	}

	return { cube };
}
