import { z } from "zod";


export const LoginSchema = z.object({
    email: z.string().trim().min(1, "Email is required").pipe(z.email("Invalid email format")),
    password: z.string().min(1, {error: "Password is required"})
});

const passwordMatchSchema = z
    .object({
        password: z.string(),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
export const RegisterSchema = z.object({
    id: z.string().trim().min(1, "Employee ID is required"),
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().min(1, "Email is required").pipe(z.email("Invalid email format")),
    password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm Password is required").min(6, "Confirm Password must be at least 6 characters"),
    hireDate: z.string().min(1, "Hire Date is required").pipe(z.coerce.date("Hire Date must be a valid date")),
    sex: z.enum(["M", "F"])
}).and(passwordMatchSchema);
