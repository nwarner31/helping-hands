import prisma from "../../utility/prisma";
import {HttpError} from "../../utility/httperror";
import {generateToken} from "../../utility/token.utility";
import jwt from "jsonwebtoken";


export async function cleanupOldTokens() {
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const oneDay = 24 * 60 * 60 * 1000;

        // Cleanup refresh tokens
        const deletedRefresh = await prisma.refreshToken.deleteMany({
            where: {
                OR: [
                    // expired > 7 days ago
                    {expiresAt: {
                            lt: new Date(now - sevenDays)
                    }},
                    // revoked > 7 days ago
                    { revoked: true,
                        revokedAt: {
                            not: null,
                            lt: new Date(now - sevenDays)
                        }
                    }
                ]
            }
        });

        // Cleanup session tokens
        const deletedSession = await prisma.session.deleteMany({
            where: {
                OR: [
                    // expired > 24h ago
                    {
                        expiresAt: {
                            lt: new Date(now - oneDay)
                        }
                    },
                    // invalid sessions > 24h old
                    {
                        isValid: false,
                        updatedAt: {
                            lt: new Date(now - oneDay)
                        }
                    }
                ]
            }
        });

        console.log(`🧹 Deleted ${deletedSession.count} old sessions`);
        console.log(`🧹 Deleted ${deletedRefresh.count} old refresh tokens`);
}

export async function createTokens(employeeId: string) {
    try {
        return await prisma.$transaction(async tx => {
            const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
            const sessionExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
            const {sessionToken, refreshToken} = generateToken(employeeId);
            const refresh = await tx.refreshToken.create({
                data: {
                    employeeId,
                    token: refreshToken,
                    expiresAt: refreshExpiresAt,
                },
            });
            const session = await tx.session.create({
                data: {
                    employeeId,
                    token: sessionToken,
                    expiresAt: sessionExpiresAt,
                },
            });
            return {
                sessionToken: session.token,
                refreshToken: refresh.token,
            };
        });
    } catch (error) {
        // istanbul ignore next
        console.error("Error generating tokens:", error);
        throw new HttpError(500, "Failed to generate tokens");
    }
}

export async function retrieveTokens(tokens: {sessionToken?: string, refreshToken?: string}) {
    try {
        const result: {session?: any, refresh?: any} = {};
        if(tokens.sessionToken) {
            const session = await prisma.session.findUnique({where: {token: tokens.sessionToken}});
            if(session) result.session = session;
        }
        if(tokens.refreshToken) {
            const refresh = await prisma.refreshToken.findUnique({where: {token: tokens.refreshToken}});
            if(refresh) result.refresh = refresh;
        }
        return result;
    } catch (error) {
        // istanbul ignore next
        console.error("Error retrieving tokens:", error);
        throw new HttpError(500, "Failed to retrieve tokens");
    }
}


export async function refreshTokens(oldRefreshToken: string) {
    try {
        const refreshPayload = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET as string) as jwt.JwtPayload;
        const {employeeId} = refreshPayload;
        // Revoke the old token
        await prisma.refreshToken.update({
            where: {token: oldRefreshToken},
            data: {revoked: true, revokedAt: new Date()},
        });

        return await createTokens(employeeId);

    } catch (error) {
        if(error instanceof Error && error.name === "TokenExpiredError") {
            throw new HttpError(401, "Refresh token expired");
        }
        throw new HttpError(401, "Invalid or revoked refresh token");
    }

}

export async function revokeTokens(tokens: {sessionToken?: string, refreshToken?: string}) {
    try {
        if(tokens.refreshToken) {
            await prisma.refreshToken.update({where: {token: tokens.refreshToken}, data: {revoked: true, revokedAt: new Date()}});

        }
        if(tokens.sessionToken) {
            await prisma.session.update({where: {token: tokens.sessionToken}, data: {isValid: false, updatedAt: new Date()}});

        }
        return true;
    } catch (error) {
        // istanbul ignore next
        return false;
    }
}