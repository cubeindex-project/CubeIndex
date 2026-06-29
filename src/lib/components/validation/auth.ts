import { z } from "zod/v4";

export const USERNAME_REGEX = /^[a-z0-9._]{3,}$/;

const email = z.email("Please enter a valid email address").nonempty();
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .nonempty();
const confirmPassword = z.string().nonempty();
const turnstile = z.string().nonempty("Please complete the Captcha");

export const loginSchema = z.object({
  email,
  password,
  "cf-turnstile-response": turnstile,
});

export const accountSchema = z
  .object({
    email,
    password,
    confirmPassword,
    acceptTOS: z.boolean().refine((v) => v === true, {
      message: "You must accept the Terms of Service",
    }),
    "cf-turnstile-response": turnstile,
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
      ]),
    )
    .min(1, "Select at least one feature that interests you"),
  other_text: z.string().trim().max(500).optional(),
});

export const completeProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .transform((s) => s.toLowerCase())
    .refine((s) => USERNAME_REGEX.test(s), {
      message:
        "Please enter a username with at least 3 characters, using only lowercase a-z, digits 0-9, dot (.) or underscore (_).",
    }),
  display_name: z
    .string()
    .trim()
    .min(4, "The display name must have more than 3 characters"),
});

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword,
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
