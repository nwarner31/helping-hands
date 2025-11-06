import { z } from "zod";

export const ClientSchema = z.object({
    id: z.string().min(1, "Client ID is required").max(40, "Client ID must be at most 40 characters"),
    legalName: z.string().min(1, "Legal name is required").max(50, "Legal name must be at most 50 characters"),
    name: z.string().max(25).optional().transform(val => val ?? null),
    dateOfBirth: z.coerce.date({invalid_type_error: "Date of birth must be a valid date"}),
    requiresStaff: z.boolean().default(false),
    sex: z.enum(["M", "F"]),
    houseId: z.string().max(45).optional().transform(val => val ?? null),
})