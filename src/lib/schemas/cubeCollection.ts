import { Constants } from "$lib/types/database.types";
import { z } from "zod";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 999;
const MAX_PURCHASE_PRICE = 100_000;
const MAX_NOTE_LENGTH = 2_000;

function isValidISODate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const [, yearText = "", monthText = "", dayText = ""] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function getTodayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export const cubeCollectionFormSchema = z
  .object({
    quantity: z
      .number()
      .int("Quantity must be a whole number.")
      .min(MIN_QUANTITY, `Quantity must be at least ${MIN_QUANTITY}.`)
      .max(MAX_QUANTITY, `Quantity cannot exceed ${MAX_QUANTITY}.`),
    condition: z.enum(Constants.public.Enums.user_cube_condition, {
      message: "Please choose a valid condition.",
    }),
    main: z.boolean(),
    status: z.enum(Constants.public.Enums.user_cube_status, {
      message: "Please choose a valid status.",
    }),
    bought_from: z.string().trim().min(1).nullable(),
    notes: z
      .string()
      .max(MAX_NOTE_LENGTH, "Notes cannot exceed 2,000 characters.")
      .nullable(),
    acquired_at: z
      .string()
      .refine((value) => value === "" || isValidISODate(value), {
        message: "Acquired date must be a valid date.",
      })
      .refine((value) => value === "" || value <= getTodayISODate(), {
        message: "Acquired date cannot be in the future.",
      })
      .nullable()
      .transform((value) => value || null),
    purchase_price: z
      .number()
      .min(0, "Price must be greater than or equal to 0.")
      .max(MAX_PURCHASE_PRICE, "Price must be between 0 and 100,000.")
      .nullable()
      .transform((value) => value ?? null),
    purchase_price_currency: z
      .string()
      .regex(/^[A-Z]{3}$/, "Currency must be a three-letter code, such as USD.")
      .nullable(),
  })
  .check((context) => {
    if (
      (context.value.purchase_price === null) !==
      (context.value.purchase_price_currency === null)
    ) {
      context.issues.push({
        code: "custom",
        message:
          "Enter both a purchase price and its currency, or leave both blank.",
        input: context.value.purchase_price_currency,
        path: ["purchase_price_currency"],
      });
    }
  });

export const cubeCollectionUpsertSchema = cubeCollectionFormSchema.extend({
  cube_id: z.number().int().positive("Cube ID must be a positive integer."),
});

export const cubeCollectionDeleteSchema = z.object({
  collection_id: z
    .number()
    .int()
    .positive("Collection ID must be a positive integer."),
});

export type CubeCollectionForm = z.input<typeof cubeCollectionFormSchema>;
export type ValidatedCubeCollectionForm = z.output<
  typeof cubeCollectionFormSchema
>;
