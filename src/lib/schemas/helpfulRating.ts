import { z } from "zod";

export const helpfulRatingToggleSchema = z.object({
  rating_id: z.number().int().positive("Rating ID must be a positive integer."),
});

export type HelpfulRatingToggle = z.input<typeof helpfulRatingToggleSchema>;
