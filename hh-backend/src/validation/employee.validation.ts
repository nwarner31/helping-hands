import { z } from "zod";

export const EmployeeSchema = z.object({
    id: z.string().min(1, "Employee ID is required").max(40, "Employee ID must be at most 40 characters"),
    name: z.string().min(1, "Name is required").max(50, "Legal name must be at most 50 characters"),
    sex: z.enum(["M", "F"]),
    hireDate: z.coerce.date({invalid_type_error: "Hire date must be a valid date"}),
    position: z.enum(["ASSOCIATE", "MANAGER", "DIRECTOR", "ADMIN"]).default("ASSOCIATE"),
    email: z.string().email("Invalid email format").max(65, "Email must be at most 65 characters"),
    password: z.string().min(6, "Password must be at least 6 characters").max(65, "Password must be at most 65 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters").max(65),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });