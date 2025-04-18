// src/routes/cube/[id]/+page.server.js
import { supabase } from '$lib/supabaseClient';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const { id } = params;

	const { data: cube, error } = await supabase
		.from('cubes')
		.select('*')
		.eq('id', id)
		.single();

	if (error || !cube) {
		console.error(error);
		return { status: 404 };
	}

	return { cube };
}
