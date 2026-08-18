import z from "zod/v4";

const httpURL = z
  .url()
  .refine(
    (value) => value.startsWith("http://") || value.startsWith("https://"),
    {
      message: "URL must use HTTP or HTTPS",
    },
  );

export const vendorFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  baseURL: httpURL,
  countryISO: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "Country code must contain two letters")
    .transform((value) => value.toUpperCase()),
  currency: z.string().trim(),
  logo: z.any().optional(),
});

export type VendorFormSchema = typeof vendorFormSchema;
