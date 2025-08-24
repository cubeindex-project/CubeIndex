// src/lib/validation/signup.ts
import { z } from "zod/v4";

const usernameRegex = /^[a-z0-9._]{3,}$/;

export const accountSchema = z
  .object({
    email: z.email("Please enter a valid email address").trim(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    acceptTOS: z.boolean().refine((v) => v === true, {
      message: "You must accept the Terms of Service",
    }),
  })
  .check((data) => {
    if (data.value.password !== data.value.confirmPassword) {
      data.issues.push({
        code: "custom",
        path: ["confirmPassword"],
        input: data.value.confirmPassword,
        message: "Passwords do not match",
      });
    }
  });

export const profileSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(4, "The display name must have more than 3 characters"),
  username: z
    .string()
    .trim()
    .transform((s) => s.toLowerCase())
    .refine((s) => usernameRegex.test(s), {
      message:
        "Please enter a username with at least 3 characters, using only lowercase a-z, digits 0-9, dot (.) or underscore (_).",
    }),
  avatar: z
    .instanceof(File, { message: "Please upload a file." })
    .refine((f) => f.size < 2 * 1024 * 1024, "Max 2 MB upload size.")
    .optional(),
});

export const surveySchema = z.object({
  discovered_via: z.enum([
    "friend",
    "discord",
    "reddit",
    "youtube",
    "search",
    "other",
  ]),
  interested_features: z
    .array(
      z.enum([
        "price_tracking",
        "collection_management",
        "ratings_reviews",
        "shop_compare",
        "alerts_discord",
        "achievements",
      ])
    )
    .min(1, "Select at least one feature that interests you"),
  other_text: z.string().trim().max(500).optional(),
});
