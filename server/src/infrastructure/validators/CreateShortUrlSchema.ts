import { z } from "zod";

/**
 * POST /
 */

export const createShortUrlSchema = z.object({
  originalUrl: z.url("Invalid URL format").trim().toLowerCase()

    .refine((url) => {
      // Check if the URL is not a short URL
      return !url.startsWith("http://localhost:3000/") && !url.startsWith("https://localhost:3000/");
    }, {
      message: "Short URLs cannot be shortened again.",
    }),
});

/**  
 * TypeScript type for CreateShortUrlSchema
 */
export type CreateShortUrlDTO = z.infer<typeof createShortUrlSchema>;
