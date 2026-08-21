import type { CubeFormSchema } from "$lib/schemas/cubeForm";
import { cleanLink } from "$lib/utils/linkCleaner";
import { StatusError } from "$lib/errors/StatusError";
import { camelToSnakeCase } from "$lib/utils/camelToSnakeCase";
import { createCubeSubmissionPayload } from "$lib/utils/submissions/cube/createCubeSubmissionPayload";
import type { Infer } from "sveltekit-superforms";

/** Saves every part of a cube form in one database transaction.
 * @param data The form data
 * @param supabase A Supabase client instance
 * @param log A server-side log instance
 * @returns The slug of the inserted or updated cube.
 */
export async function submitCube(
  data: Infer<CubeFormSchema>,
  supabase: App.Locals["supabase"],
  targetCubeID?: number,
): Promise<void> {
  const cube = await createCubeSubmissionPayload(data, supabase, targetCubeID);

  const featureCodes = Object.entries(data.features)
    .filter(([, present]) => present)
    .map(([key]) => camelToSnakeCase(key));

  const { data: features } = await supabase
    .from("cube_features")
    .select("id")
    .in("code", featureCodes)
    .throwOnError();

  const vendorLinks = data.vendorLinks.map((vendorLink) => ({
    vendor_id: vendorLink.vendor_id,
    url: cleanLink(vendorLink.url),
    available: vendorLink.available,
    price: vendorLink.price,
  }));

  const { error } = await supabase.rpc("submit_cube", {
    p_operation: targetCubeID ? "update" : "create",
    p_submitter_note: data.submitterNote,
    p_cube: { ...cube, target_cube_id: targetCubeID ?? null },
    p_feature_ids: features.map(({ id }) => id),
    p_vendor_links: vendorLinks,
  });

  if (error) {
    const duplicate = error.code === "23505";
    throw new StatusError(
      duplicate ? 400 : 500,
      duplicate
        ? "One of the provided entries or the cube itself may already exist."
        : "An error occurred while saving the cube",
    );
  }
}
