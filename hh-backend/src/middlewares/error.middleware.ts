import { Request, Response, NextFunction } from "express";

interface ApiError {
    status?: number;
    message: string;
}

// Custom error-handling middleware
const errorMiddleware = (err: ApiError, req: Request, res: Response, next: NextFunction) => {

    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};

export default errorMiddleware;
