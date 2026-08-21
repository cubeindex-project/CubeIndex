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
  .check((context) => {
    const firstIndexByVendorID = new Map<number, number>();

    context.value.forEach((vendorLink, index) => {
      const firstIndex = firstIndexByVendorID.get(vendorLink.vendor_id);

      if (firstIndex === undefined) {
        firstIndexByVendorID.set(vendorLink.vendor_id, index);
        return;
      }

      context.issues.push({
        code: "custom",
        message: `A link for this vendor was already added in row ${firstIndex + 1}`,
        input: vendorLink.vendor_id,
        path: [index, "vendor_id"],
      });
    });
  })
  .default([]);

export const cubeFormSchema = z
  .object({
    name: z.string().trim().nonempty(),
    seriesID: optionalIdOrOtherSchema,
    otherSeries: z.string().trim().default(""),
    versionType: z.enum(Constants.public.Enums.cube_version_type),
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
      .enum([...Constants.public.Enums.cube_surface_finish])
      .optional(),
    weight: z.coerce.number().min(1).optional(),
    size: z.coerce
      .string()
      .trim()
      .refine((value) => value === "" || sizePattern.test(value), {
        message: "Size must be num x num x num",
      })
      .optional(),
    discontinued: z.coerce.boolean().default(false),
    submitterNote: z.string().trim().nonempty().default(""),
    features: featuresSchema,
    vendorLinks: vendorLinksSchema,
  })
  .check((context) => {
    if (
      context.value.brandID === "___other" &&
      context.value.otherBrand.trim().length === 0
    ) {
      context.issues.push({
        code: "custom",
        message: "Brand is required",
        input: context.value.otherBrand,
        path: ["otherBrand"],
      });
    }

    if (
      context.value.typeID === "___other" &&
      context.value.otherType.trim().length === 0
    ) {
      context.issues.push({
        code: "custom",
        message: "Type is required",
        input: context.value.otherType,
        path: ["otherType"],
      });
    }

    if (
      context.value.seriesID === "___other" &&
      context.value.otherSeries.length === 0
    ) {
      context.issues.push({
        code: "custom",
        message: "Series is required",
        input: context.value.otherSeries,
        path: ["otherSeries"],
      });
    }

    const requiresRelatedCube =
      context.value.features.modded || context.value.versionType !== "Base";

    if (requiresRelatedCube && context.value.relatedToId === undefined) {
      context.issues.push({
        code: "custom",
        message:
          "Select the base model this variant, limited edition, or modification is based on",
        input: context.value.relatedToId,
        path: ["relatedToId"],
      });
    }

    if (!requiresRelatedCube && context.value.relatedToId !== undefined) {
      context.issues.push({
        code: "custom",
        message:
          "A related model can only be set for variants, limited editions, or commercially modified cubes",
        input: context.value.relatedToId,
        path: ["relatedToId"],
      });
    }
  });

export type CubeFormSchema = typeof cubeFormSchema;
