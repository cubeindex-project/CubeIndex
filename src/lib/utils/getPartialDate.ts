import type { Enums } from "$lib/types/database.types";

/**
 * Truncates an ISO-like date string to its specified precision.
 */
export function getPartialDate(
  date: string,
  precision: Enums<"date_precision">,
): string {
  return date.slice(
    0,
    precision === "year" ? 4 : precision === "month" ? 7 : 10,
  );
}
