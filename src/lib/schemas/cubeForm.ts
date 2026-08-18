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
      vendor_name: z.string().trim().min(1, "Vendor name is required"),
      url: z.url().trim(),
      price: z.coerce.number().min(0, "Price must be >= 0"),
      available: z.coerce.boolean().default(false),
    }),
  )
  .default([]);

export const cubeFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    seriesId: z.number().int().nonnegative().optional(),
    otherSeries: z.string().trim().default(""),
    versionType: z.enum(Constants.public.Enums.cube_version_types),
    brand: z.string().trim().min(1, "Brand is required"),
    otherBrand: z.string().trim().default(""),
    type: z.string().trim().min(1, "Type is required"),
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
    weight: z.coerce.number().min(0, "Weight must be >= 0").optional(),
    size: z.coerce
      .string()
      .trim()
      .refine((val) => sizePattern.test(val), {
        message: "Size must be num x num x num",
      })
      .optional(),
    discontinued: z.coerce.boolean().default(false),
    features: featuresSchema,
    vendorLinks: vendorLinksSchema,
  })
  .check((data) => {
    if (
      data.value.brand === "___other" &&
      (!data.value.otherBrand || data.value.otherBrand.trim().length === 0)
    ) {
      data.issues.push({
        code: "custom",
        message: "Brand is required",
        input: data.value.otherBrand,
        path: ["otherBrand"],
      });
    }

    if (
      data.value.type === "___other" &&
      (!data.value.otherType || data.value.otherType.trim().length === 0)
    ) {
      data.issues.push({
        code: "custom",
        message: "Type is required",
        input: data.value.otherType,
        path: ["otherType"],
      });
    }
  });

export type CubeFormSchema = typeof cubeFormSchema;
