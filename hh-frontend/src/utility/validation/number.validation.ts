export function validateNumber(
    value: string,
    fieldName: string,
    options?: {
        min?: number;
        max?: number;
        isInteger?: boolean;
    }
): string | undefined {
    if (value.trim() === "") {
        return `${fieldName} is required`;
    }
    const num = Number(value);

    if (isNaN(num)) {
        return `${fieldName} must be a valid number`;
    }

    if (options?.isInteger && !Number.isInteger(num)) {
        return `${fieldName} must be an integer`;
    }

    if (options?.min !== undefined && num < options.min) {
        return `${fieldName} must be at least ${options.min}`;
    }

    if (options?.max !== undefined && num > options.max) {
        return `${fieldName} must be at most ${options.max}`;
    }

    return undefined;
}