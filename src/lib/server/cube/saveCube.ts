import type { CubeFormSchema } from "$lib/schemas/cubeForm";
import { cleanLink } from "$lib/components/helper_functions/linkCleaner";
import { StatusError } from "$lib/errors/StatusError";
import { camelToSnakeCase } from "$lib/utils/camelToSnakeCase";
import { createCubeFormPayload } from "$lib/utils/createCubeFormPayload";
import { isValueOther } from "$lib/utils/isValueOther";
import type { Infer } from "sveltekit-superforms";
import type { Tables } from "$lib/types/database.types";

/** Saves every part of a cube form in one database transaction.
 * @param data The form data
 * @param supabase A Supabase client instance
 * @param log A server-side log instance
 * @param currentSlug Optional slug of the cube being edited. Omit when creating a new cube.
 * @returns The slug of the inserted or updated cube.
 */
export async function saveCube(
  data: Infer<CubeFormSchema>,
  supabase: App.Locals["supabase"],
  log: App.Locals["log"],
  currentSlug?: string,
): Promise<string> {
  const newBrand = isValueOther(data.brand) ? data.otherBrand : null;
  const newType = isValueOther(data.type) ? data.otherType : null;
  const newSeries = data.otherSeries || null;
  const cube = createCubeFormPayload({
    data,
    brand: newBrand ?? data.brand,
    cubeType: newType ?? data.type,
    seriesID: data.seriesId,
  });
  const features = Object.entries(data.features)
    .filter(([, present]) => present)
    .map(([key]) => camelToSnakeCase(key));
  const vendorLinks = data.vendorLinks.map((vendorLink) => ({
    vendor_name: vendorLink.vendor_name,
    url: cleanLink(vendorLink.url),
    available: vendorLink.available,
    price: vendorLink.price,
  })) satisfies Pick<
    Tables<"cube_vendor_links">,
    "vendor_name" | "url" | "available" | "price"
  >[];

  const { data: savedSlug, error } = await supabase.rpc("save_cube", {
    p_current_slug: currentSlug ?? null,
    p_cube: cube,
    p_features: features,
    p_vendor_links: vendorLinks,
    p_new_brand: newBrand,
    p_new_type: newType,
    p_new_series: newSeries,
  });

  if (error) {
    log.error({ err: error.message }, "Failed to save cube");
    const duplicate = error.code === "23505";
    throw new StatusError(
      duplicate ? 400 : 500,
      duplicate
        ? "One of the provided entries or the cube itself may already exist."
        : "An error occurred while saving the cube",
    );
  }

  return savedSlug;
}
