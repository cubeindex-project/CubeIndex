import { z } from "zod";

export const awardsVoteSchema = z.object({
  category_id: z.number().int().positive(),
  nominee_id: z.number().int().positive(),
});

export type AwardsVoteSchema = z.input<typeof awardsVoteSchema>;
