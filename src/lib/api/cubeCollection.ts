import {
  cubeCollectionDeleteSchema,
  cubeCollectionUpsertSchema,
  type CubeCollectionForm,
} from "$lib/schemas/cubeCollection";
import { getZodErrorMessage } from "$lib/utils/getZodErrorMessage";

export async function saveCubeInCollection(
  cubeID: number,
  form: CubeCollectionForm,
): Promise<void> {
  const parsedPayload = cubeCollectionUpsertSchema.safeParse({
    cube_id: cubeID,
    ...form,
  });

  if (!parsedPayload.success) {
    throw new Error(getZodErrorMessage(parsedPayload.error));
  }

  let response: Response;
  try {
    response = await fetch("/api/collection/cube/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedPayload.data),
    });
  } catch (error) {
    throw new Error(
      "Network error. Please check your connection and try again.",
      { cause: error },
    );
  }

  let data: { error?: string } | undefined;
  try {
    data = (await response.json()) as { error?: string };
  } catch {
    // An error response is allowed not to have a JSON body.
  }

  if (!response.ok) {
    throw new Error(data?.error ?? "Unable to add the cube. Please try again.");
  }
}

export async function deleteCubeFromCollection(
  collectionID: number,
): Promise<void> {
  const parsedPayload = cubeCollectionDeleteSchema.safeParse({
    collection_id: collectionID,
  });

  if (!parsedPayload.success) {
    throw new Error(getZodErrorMessage(parsedPayload.error));
  }

  let response: Response;
  try {
    response = await fetch("/api/collection/cube/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedPayload.data),
    });
  } catch (error) {
    throw new Error(
      "Network error. Please check your connection and try again.",
      { cause: error },
    );
  }

  let data: { error?: string } | undefined;
  try {
    data = (await response.json()) as { error?: string };
  } catch {
    // An error response is allowed not to have a JSON body.
  }

  if (!response.ok) {
    throw new Error(
      data?.error ?? "Unable to delete the cube. Please try again.",
    );
  }
}
