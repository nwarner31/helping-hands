import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {getEmployeeById} from "../services/auth.service";
import {generateAccessToken} from "../utility/token.utility";

function verifyAccessToken(token: string) {
    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
        return { valid: true, expired: false, decoded: payload };
    } catch (err: any) {
        return {
            valid: false,
            expired: err.name === "TokenExpiredError",
            decoded: null,
        };
    }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    let accessToken = authHeader?.split(" ")[1];

    try {
        // If no access token or it is expired
        if (!accessToken || verifyAccessToken(accessToken).expired) {
            const refreshToken = req.cookies?.refreshToken;
            // If no refresh token also
            if(!refreshToken) {
                res.sendStatus(401);
                return;
            }
            // Uses the refresh token and generates a new access token and puts it on a header
            const {employeeId} = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as jwt.JwtPayload;
            accessToken = await generateAccessToken(refreshToken);
            res.setHeader('x-access-token', accessToken);
        }
        // Uses the access token to get the employee's data and put it on the request
        const payload = jwt.verify(accessToken!, process.env.ACCESS_TOKEN_SECRET as string);
        const {employeeId} = payload as jwt.JwtPayload;
        const employee = await getEmployeeById(employeeId);
        if(!employee) throw new Error("Employee not found")
        req.employee = employee;
        next();
    } catch (err) {
         res.sendStatus(403);
         return;
    }
}


export function requirePositions(...allowedPositions: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.employee) {
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