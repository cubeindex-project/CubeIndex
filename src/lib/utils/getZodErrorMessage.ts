import type z from "zod/v4";

export function getZodErrorMessage(error: z.ZodError): string {
  return error.issues[0].message ?? "Please correct the invalid fields.";
}
