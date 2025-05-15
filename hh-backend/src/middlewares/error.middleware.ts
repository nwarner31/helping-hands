import { Request, Response, NextFunction } from "express";

interface ApiError extends Error {
    status?: number;
    message: string;
    errors?: {[key: string]: string | string[] };
}

// Custom error-handling middleware
const errorMiddleware = (err: ApiError, req: Request, res: Response, next: NextFunction) => {

    const statusCode = err.status ?? 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || undefined
    });
};

export default errorMiddleware;
