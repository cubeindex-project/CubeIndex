import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';
import { configCatClient } from '$lib/configcatClient';

export const load = async () => {
  let databaseAvailability: boolean = true;
  let cubesAvailability: boolean = true;

  configCatClient.getValueAsync("database", false).then((value) => {
    databaseAvailability = value;
  });

  configCatClient.getValueAsync("cubes", false).then((value) => {
    cubesAvailability = value;
  });

  if (databaseAvailability || cubesAvailability) {
    const { data: cubes, error: err } = await supabase
      .from('cube_models')
      .select('*')
      .order('model', { ascending: true })
      .order('series', { ascending: true });


    if (err) throw error(500, err.message);

    return { cubes, databaseAvailability, cubesAvailability };
  }

  return { databaseAvailability, cubesAvailability };
}