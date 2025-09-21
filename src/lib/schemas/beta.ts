import { z } from "zod/v4";

export const betaPreferenceSchema = z.object({
	beta_access: z.boolean(),
});

export type BetaPreferenceInput = z.infer<typeof betaPreferenceSchema>;
