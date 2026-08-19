import { Constants } from "$lib/types/database.types.js";
import { error } from "@sveltejs/kit";

export async function loadCubeFormOptions(
  supabase: App.Locals["supabase"],
  log: App.Locals["log"],
) {
  try {
    const [brands, types, series, features, vendors, cubes] = await Promise.all(
      [
        supabase.from("brands").select("id, name").order("name").throwOnError(),
        supabase
          .from("cube_types")
          .select("id, name")
          .order("name")
          .throwOnError(),
        supabase
          .from("cube_series")
          .select("name, id")
          .order("name")
          .throwOnError(),
        supabase
          .from("cube_features")
          .select("label, code")
          .order("label")
          .throwOnError(),
        supabase
          .from("vendors")
          .select("id, name, base_url, currency")
          .eq("status", "Approved")
          .order("name")
          .throwOnError(),
        supabase
          .from("v_detailed_cube_models")
          .select("id, name, slug, image_url")
          .eq("version_type", "Base")
          .throwOnError(),
      ],
    );

    return {
      cubes: cubes.data,
      brands: brands.data,
      types: types.data,
      series: series.data,
      features: features.data,
      vendors: vendors.data,
      surfaces: [...Constants.public.Enums.cube_surface_finishes],
      subTypes: [...Constants.public.Enums.cubes_subtypes],
      cubeVersions: [...Constants.public.Enums.cube_version_types],
    };
  } catch (cause) {
    log.error({ err: cause }, "Failed to load cube form options");
    return error(500, "Failed to load cube form options");
  }
}
