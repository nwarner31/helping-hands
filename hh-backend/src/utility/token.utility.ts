import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
export const generateToken = (employeeId: string) => {
    const accessToken = jwt.sign({employeeId}, ACCESS_TOKEN_SECRET, {expiresIn: "15m"});
    const refreshToken = jwt.sign({employeeId}, REFRESH_TOKEN_SECRET, {expiresIn: "7d"});
    return {accessToken, refreshToken};
}