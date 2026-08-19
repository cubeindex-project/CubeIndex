import z from "zod/v4";
import { Constants, type Enums } from "$lib/types/database.types";

export const sizePattern =
  /^[0-9]+(\.[0-9]+)?\sx\s[0-9]+(\.[0-9]+)?\sx\s[0-9]+(\.[0-9]+)?$/;

export interface NormalizedReleaseDate {
  date: string;
  precision: Enums<"date_precision">;
}

export function normalizeReleaseDate(
  value: string,
): NormalizedReleaseDate | null {
  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(value);
  if (!match) return null;

  const [, year, suppliedMonth, suppliedDay] = match;
  const month = suppliedMonth ?? "01";
  const day = suppliedDay ?? "01";
  const date = `${year}-${month}-${day}`;

  if (
    !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) ||
    new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date
  ) {
    return null;
  }

  return {
    date,
    precision: suppliedDay ? "day" : suppliedMonth ? "month" : "year",
  };
}

const defaultFeatures = {
  wcaLegal: false,
  magnetic: false,
  smart: false,
  modded: false,
  maglev: false,
  stickered: false,
  ballCore: false,
};

/**
 * Form controls submit IDs as strings. Keeping this schema single-typed gives
 * Superforms a neutral empty default; IDs are converted at the database boundary.
 */
const idOrOtherSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "___other" || /^[1-9][0-9]*$/.test(value),
    "Selection is required",
  );

const optionalIdOrOtherSchema = idOrOtherSchema.optional();

const featuresSchema = z
  .object({
    wcaLegal: z.coerce.boolean().default(false),
    magnetic: z.coerce.boolean().default(false),
    smart: z.coerce.boolean().default(false),
    modded: z.coerce.boolean().default(false),
    maglev: z.coerce.boolean().default(false),
    stickered: z.coerce.boolean().default(false),
    ballCore: z.coerce.boolean().default(false),
  })
  .default(defaultFeatures)
  .check((data) => {
    if (data.value.smart && data.value.wcaLegal) {
      data.issues.push({
        code: "custom",
        message: "Smart cubes cannot be WCA Legal",
        input: data.value.wcaLegal,
        path: ["wcaLegal"],
      });
    }
  });

const vendorLinksSchema = z
  .array(
    z.object({
      vendor_id: z.number().int().min(1, "Please choose a valid vendor"),
      url: z.url().trim(),
      price: z.coerce.number().min(0, "Price must be >= 0"),
      available: z.coerce.boolean().default(false),
    }),
  )
  .default([]);

export const cubeFormSchema = z
  .object({
    name: z.string().trim().nonempty(),
    seriesID: optionalIdOrOtherSchema,
    otherSeries: z.string().trim().default(""),
    versionType: z.enum(Constants.public.Enums.cube_version_types),
    brandID: idOrOtherSchema,
    otherBrand: z.string().trim().default(""),
    typeID: idOrOtherSchema,
    otherType: z.string().trim().default(""),
    subType: z
      .enum(["auto", ...Constants.public.Enums.cubes_subtypes])
      .default("auto"),
    relatedToId: z.number().int().optional(),
    releaseDate: z
      .string()
      .trim()
      .refine((value) => value === "" || normalizeReleaseDate(value) !== null, {
        message: "Release date must be YYYY, YYYY-MM, or YYYY-MM-DD",
      })
      .optional(),
    imageUrl: z.url(),
    surfaceFinish: z
      .enum([...Constants.public.Enums.cube_surface_finishes])
      .optional(),
    weight: z.coerce.number().nonnegative().optional(),
    size: z.coerce
      .string()
      .trim()
      .refine((val) => sizePattern.test(val), {
        message: "Size must be num x num x num",
      })
      .optional(),
    discontinued: z.coerce.boolean().default(false),
    submitterNote: z.string().trim().nonempty().default(""),
    features: featuresSchema,
    vendorLinks: vendorLinksSchema,
  })
  .check((data) => {
    if (
      data.value.brandID === "___other" &&
      data.value.otherBrand.trim().length === 0
    ) {
      data.issues.push({
        code: "custom",
        message: "Brand is required",
        input: data.value.otherBrand,
        path: ["otherBrand"],
      });
    }

    if (
      data.value.typeID === "___other" &&
      data.value.otherType.trim().length === 0
    ) {
      data.issues.push({
        code: "custom",
        message: "Type is required",
        input: data.value.otherType,
        path: ["otherType"],
      });
    }

    if (
      data.value.seriesID === "___other" &&
      data.value.otherSeries.length === 0
    ) {
      data.issues.push({
        code: "custom",
        message: "Series is required",
        input: data.value.otherSeries,
        path: ["otherSeries"],
      });
    }
  });

export type CubeFormSchema = typeof cubeFormSchema;
