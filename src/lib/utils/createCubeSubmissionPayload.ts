import { cleanLink } from "$lib/components/helper_functions/linkCleaner";
import { getSubTypes } from "$lib/components/helper_functions/subType.svelte";
import {
  normalizeReleaseDate,
  type CubeFormSchema,
} from "$lib/schemas/cubeForm";
import type { Infer } from "sveltekit-superforms";
import type { Tables } from "$lib/types/database.types";
import { isValueOther } from "./isValueOther";

export function createCubeSubmissionPayload(
  data: Infer<CubeFormSchema>,
  typeName: string,
  targetCubeID?: number,
): Omit<Tables<"cube_submissions">, "created_at" | "id" | "submission_id"> {
  const subType =
    data.subType === "auto" ? getSubTypes(typeName) : data.subType;
  const releaseDate = data.releaseDate
    ? normalizeReleaseDate(data.releaseDate)
    : null;

  return {
    target_cube_id: targetCubeID ?? null,
    name: data.name,
    series_id:
      data.seriesID && !isValueOther(data.seriesID)
        ? Number(data.seriesID)
        : null,
    proposed_series_name: isValueOther(data.seriesID) ? data.otherSeries : null,
    brand_id: isValueOther(data.brandID) ? null : Number(data.brandID),
    proposed_brand_name: isValueOther(data.brandID) ? data.otherBrand : null,
    type_id: isValueOther(data.typeID) ? null : Number(data.typeID),
    proposed_type_name: isValueOther(data.typeID) ? data.otherType : null,
    sub_type: subType,
    release_date: releaseDate?.date ?? null,
    release_date_precision: releaseDate?.precision ?? null,
    image_url: cleanLink(data.imageUrl),
    surface_finish: data.surfaceFinish ?? null,
    weight: data.weight ?? null,
    size: data.size ?? null,
    version_type: data.versionType,
    related_to_id: data.relatedToId ?? null,
    discontinued: data.discontinued,
  };
}
