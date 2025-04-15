import { supabase } from "$lib/supabaseClient";

export async function load() {
    const { data } = await supabase.from("cubes").select();
    return {
        cubes: data ?? [],
    };
}