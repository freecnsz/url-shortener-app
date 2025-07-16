import { z } from "zod";

/**
 * POST /api/auth/login body validation for user login
 */

export const loginSchema = z.object({
  email: z.string().email("Invalid email address.").toLowerCase().trim(),
  password: z
    .string("Password is required.")
    .min(6, "Password must be at least 6 characters long.")
    .max(100, "Password must be at most 100 characters long."),
});

/**
 * TypeScript type for LoginSchema
 */
export type LoginDTO = z.infer<typeof loginSchema>;
