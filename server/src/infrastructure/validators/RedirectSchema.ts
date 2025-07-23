import {z} from "zod";

export const redirectSchema = z.object({
  shortCode: z.string()
});

/**  
 * TypeScript type for RedirectSchema
 */
export type RedirectDTO = z.infer<typeof redirectSchema>;
