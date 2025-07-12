import { Request, Response, NextFunction } from "express";
import {HttpError} from "../utility/httperror";

const isDev = process.env.NODE_ENV?.toLowerCase() === "development";
// Custom error-handling middleware
const errorMiddleware = (err: HttpError, req: Request, res: Response, next: NextFunction) => {

    const statusCode = err.status ?? 500;

    if (!err.status) {
        console.error("Unexpected error:", err);
    }
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors ?? {},
        ...(isDev ? {stack: err.stack} : {})
    });
};

export default errorMiddleware;
