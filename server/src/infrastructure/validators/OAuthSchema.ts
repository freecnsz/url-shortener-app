import { z } from 'zod';

export const oAuthSchema = z.object({
  accessToken: z.string("Access token is required.")
});

/**
 * TypeScript type for OAuthSchema
 */
export type OAuthDTO = z.infer<typeof oAuthSchema>;