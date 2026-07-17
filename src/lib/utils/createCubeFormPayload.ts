import { slugify } from "$lib/components/helper_functions/slugify.svelte";
import { cleanLink } from "$lib/components/helper_functions/linkCleaner";
import { getSubTypes } from "$lib/components/helper_functions/subType.svelte";
import {
  normalizeReleaseDate,
  type CubeFormSchema,
} from "$lib/schemas/cubeForm";
import type { Infer } from "sveltekit-superforms";

interface CreateCubeFormPayloadParameters {
  data: Infer<CubeFormSchema>;
  brand: string;
  cubeType: string;
  seriesID: number | undefined;
}

export function createCubeFormPayload({
  data,
  brand,
  cubeType,
  seriesID,
}: CreateCubeFormPayloadParameters) {
  const subType =
    data.subType === "auto" ? getSubTypes(cubeType) : data.subType;
  const releaseDate = data.releaseDate
    ? normalizeReleaseDate(data.releaseDate)
    : null;

  return {
    name: data.name,
    slug: slugify(data.name),
    series_id: seriesID ?? null,
    brand,
    type: cubeType,
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
