import { z } from "zod";

export const awardsVoteSchema = z.object({
  category_id: z.number(),
  nominee_id: z.number(),
});

export type AwardsVoteSchema = z.input<typeof awardsVoteSchema>;
