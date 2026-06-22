
import z from "zod";
export const registerSchema = z.object({
    firstName: z.string().min(3, "firstName must be at least 3 characters"),
    lastName: z.string().min(1, "lastName must be at least 1 characters"),
    email: z.string().email("invalid email"),
    password: z.string().min(6, "password must be at least 6 characters"),
    city: z.string().min(2, "city is required"),
});

export const loginSchema = z.object({
    email: z.string().email("invalid email"),
    password: z.string().min(1, "password is required"),
});