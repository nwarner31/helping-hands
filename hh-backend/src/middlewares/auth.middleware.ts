import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {getEmployeeById} from "../services/auth.service";
import {
    refreshTokens,
    retrieveTokens,
} from "../services/utility/token.service";
import {RefreshToken, Session} from "@prisma/client";


export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    let sessionToken = authHeader?.split(" ")[1];

    let refreshToken = req.cookies?.refreshToken;
    try {
        const tokens: {session?: Session, refresh?: RefreshToken} = await retrieveTokens({sessionToken, refreshToken});
        let employeeId: string;
        const now = new Date();

        // This is to check for malformed session tokens
        if (sessionToken) {
            try {
                jwt.verify(sessionToken, process.env.SESSION_TOKEN_SECRET as string) as jwt.JwtPayload;
            } catch (err: any) {
                if (err.name !== "TokenExpiredError") {
                    res.sendStatus(403);
                    return;
                }
            }
        }

        // If no session token or it is invalid/expired
        if (!tokens.session || !tokens.session.isValid || tokens.session.expiresAt < now) {

            // If no refresh token or is revoked/expired, deny access
            if(!tokens.refresh || tokens.refresh.expiresAt < now || tokens.refresh.revoked) {
                res.sendStatus(401);
                return;
            }
            // generate new tokens
            ({refreshToken, sessionToken} = await refreshTokens(tokens.refresh.token));
            // Set the new tokens in the response
            res.cookie("refreshToken", refreshToken, {httpOnly: true, secure: process.env.NODE_ENV === "production" });
            res.setHeader('x-session-token', sessionToken);
            const sessionPayload = jwt.verify(sessionToken, process.env.SESSION_TOKEN_SECRET as string) as jwt.JwtPayload;
            ({employeeId} = sessionPayload);
        } else {
            // Session token is valid
            const sessionPayload = jwt.verify(sessionToken!, process.env.SESSION_TOKEN_SECRET as string) as jwt.JwtPayload;
            ({employeeId} = sessionPayload);
        }
        // Uses the refresh token to get the employee's data and put it on the request
        const employee = await getEmployeeById(employeeId);
        if(!employee) throw new Error("Employee not found")
        req.employee = employee;
        next();
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
        return;
    }
}


export function requirePositions(...allowedPositions: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        // This should normally not happen if authenticateToken is used before this middleware
        if (!req.employee) {
            // istanbul ignore next
            res.sendStatus(401);
            return;
        }

        const employeePosition = req.employee.position; // assuming req.user was set in authenticateToken
        if (!allowedPositions.includes(employeePosition)) {
             res.sendStatus(403);
             return;
        }

        next();
    };
}