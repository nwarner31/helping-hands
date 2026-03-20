import { z } from "zod";

export type ErrorType = string | undefined;

export type ValidationErrors = Record<string, string>;

export function mapZodErrors(
    error: z.ZodError): ValidationErrors {
    const fieldErrors: ValidationErrors = {};

    for (const issue of error.issues) {
        const field = issue.path.join(".");

        if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
        }
    }

    return fieldErrors;
}
