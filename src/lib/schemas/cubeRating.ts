import { z } from "zod";

const MIN_RATING = 0.5;
const MAX_RATING = 5;
const RATING_STEP = 0.5;
const MAX_COMMENT_LENGTH = 500;

export const cubeRatingFormSchema = z.object({
  rating: z
    .number()
    .min(MIN_RATING, "Please select a rating.")
    .max(MAX_RATING, "Rating cannot exceed 5 stars.")
    .multipleOf(RATING_STEP, "Rating must be in half-star increments."),
  comment: z
    .string()
    .trim()
    .max(MAX_COMMENT_LENGTH, "Comment cannot exceed 500 characters."),
});

export const cubeRatingUpsertSchema = cubeRatingFormSchema.extend({
  cube_id: z.number().int().positive("Cube ID must be a positive integer."),
});

export const cubeRatingDeleteSchema = z.object({
  rating_id: z.number().int().positive("Rating ID must be a positive integer."),
});

export type CubeRatingForm = z.input<typeof cubeRatingFormSchema>;
export type ValidatedCubeRatingForm = z.output<typeof cubeRatingFormSchema>;
