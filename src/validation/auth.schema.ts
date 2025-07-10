import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[0-9])(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).*$/,
      "Password must include at least one number and one special character"
    ),
  role: z.string().optional(), // or z.enum(['admin', 'viewer']) if roles are strict
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
