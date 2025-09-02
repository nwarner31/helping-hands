import { z } from "zod";

export const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid YYYY-MM format");

export const dateSchema = z.string().regex(
    /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
    "Invalid YYYY-MM-DD format"
).refine((d) => !isNaN(Date.parse(d)), "Invalid date");

export const rangeSchema = z.object({
    from: dateSchema,
    to: dateSchema,
}).refine(
    (data) => new Date(data.from) <= new Date(data.to),
    { message: "From must be before To", path: ["from"] }
);
