export class HttpError extends Error {
    status?: number;
    errors?: { [key: string]: string };

    constructor(status: number, message: string, errors?: { [key: string]: string }) {
        super(message);
        this.name = "HttpError";
        this.status = status;
        this.errors = errors;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, HttpError);
        }
    }
}
