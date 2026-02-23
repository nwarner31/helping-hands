import { z } from "zod";

export type ErrorType = string | undefined;

export type ValidationErrors = {
    [key: string]: string | ValidationErrors;
};

export function mapZodErrorsFromSchema<T extends z.ZodTypeAny>(
    error: z.ZodError<z.infer<T>>): Partial<Record<keyof z.infer<T>, string>> {
    const fieldErrors: Partial<Record<keyof z.infer<T>, string>> = {};

    for (const issue of error.issues) {
        const field = issue.path[0] as keyof z.infer<T>;

        if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
        }
    }

    return fieldErrors;
}
