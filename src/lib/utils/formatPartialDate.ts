import type { Enums } from "$lib/types/database.types";

export function formatPartialDate(
  date: string,
  precision: Enums<"date_precision">,
): string {
  const options: Intl.DateTimeFormatOptions =
    precision === "year"
      ? { year: "numeric", timeZone: "UTC" }
      : precision === "month"
        ? { year: "numeric", month: "long", timeZone: "UTC" }
        : {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          };

  return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
}
