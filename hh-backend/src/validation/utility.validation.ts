import { z } from "zod";

export const isValidMonth = (value: string) => {
    const yearRegex = /^(19|20)\d{2}-(0[1-9]|1[0-2])/;
    return yearRegex.test(value);
}

export const isValidDate = (value: string) => {
    const dateRegex = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    return dateRegex.test(value);
}

export const optionalNullableString = (max: number) =>
    z.string().max(max).nullish().transform((v) => v ?? null);

// helper to flatten errors into { field: "message" }
export function flattenErrors(error: z.ZodError) {
        const fieldErrors: Record<string, string | undefined> = {};

        for (const issue of error.issues) {
            const field = issue.path.join(".");

            if (!fieldErrors[field]) {
                fieldErrors[field] = issue.message;
            }
        }

        return fieldErrors;
}