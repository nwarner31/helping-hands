import { Request, Response, NextFunction } from "express";
import { logger } from "../utility/logger";

export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;

        logger.info(
            {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                duration,
            },
            "request completed"
        );
    });

    next();
};


export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const employeeId = req.employee!.id;

    req.log = logger.child({employeeId: employeeId});

    next();
}