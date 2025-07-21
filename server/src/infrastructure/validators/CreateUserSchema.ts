import { z } from "zod";
import fi from "zod/v4/locales/fi.cjs";

/**
 *  POST /api/auth/register  body validation for user registration
 */
export const createUserSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address." })
    .toLowerCase()
    .trim(),
  username: z.string()
    .min(3, "Username must be at least 3 characters long.")
    .max(30, "Username cannot exceed 30 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores.")
    .trim()
    .optional(),
  password: z.string()
    .min(3, "Password must be at least 3 characters long."),
    // .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    //   "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character."),
  firstName: z.string()
    .max(50, "First name cannot exceed 50 characters.")
    .trim()
    .optional(),
  lastName: z.string()
    .max(50, "Last name cannot exceed 50 characters.")
    .trim()
    .optional(),
});

/**  
 * TypeScript type for CreateUserSchema
 */
export type CreateUserDTO = z.infer<typeof createUserSchema>;