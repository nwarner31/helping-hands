import jwt from "jsonwebtoken";


const SESSION_TOKEN_SECRET = process.env.SESSION_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
export const generateToken = (employeeId: string) => {
    const randomUUID = crypto.randomUUID();
    const sessionToken = jwt.sign({employeeId, randomUUID}, SESSION_TOKEN_SECRET, {expiresIn: "15m"});
    const refreshToken = jwt.sign({employeeId, randomUUID}, REFRESH_TOKEN_SECRET, {expiresIn: "7d"});
    return {sessionToken, refreshToken};
}