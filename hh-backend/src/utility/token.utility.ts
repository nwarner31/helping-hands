import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {getEmployeeById} from "../services/auth.service";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
export const generateToken = (employeeId: string) => {
    const accessToken = jwt.sign({employeeId}, ACCESS_TOKEN_SECRET, {expiresIn: "15m"});
    const refreshToken = jwt.sign({employeeId}, REFRESH_TOKEN_SECRET, {expiresIn: "7d"});
    return {accessToken, refreshToken};
}

export const generateAccessToken = async (refreshToken: string) => {
    const {employeeId} = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as jwt.JwtPayload;
    const employee = await getEmployeeById(employeeId);
    if(!employee) throw new Error("Employee not found")
    const accessToken = jwt.sign({employeeId}, ACCESS_TOKEN_SECRET, {expiresIn: "15m"});
    return accessToken;
}