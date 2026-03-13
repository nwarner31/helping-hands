import prisma from "../../../utility/prisma";
import jwt from "jsonwebtoken";
import { HttpError } from "../../../utility/httperror";
import { createTokens, refreshTokens, retrieveTokens } from "../../../services/utility/token.service";
import { generateToken } from "../../../utility/token.utility";

jest.mock("../../../utility/prisma", () => ({
    __esModule: true,
    default: {
        $transaction: jest.fn(),
        refreshToken: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        session: {
            create: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}));

jest.mock("jsonwebtoken", () => ({
    __esModule: true,
    default: {
        verify: jest.fn(),
    },
}));

jest.mock("../../../utility/token.utility", () => ({
    __esModule: true,
    generateToken: jest.fn(),
}));

describe("createTokens()", () => {
    const mockedTransaction = prisma.$transaction as unknown as jest.Mock;
    const mockedGenerateToken = generateToken as unknown as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("creates and returns session and refresh tokens", async () => {
        const txRefreshCreate = jest.fn().mockResolvedValue({ token: "new-refresh-token" });
        const txSessionCreate = jest.fn().mockResolvedValue({ token: "new-session-token" });

        mockedGenerateToken.mockReturnValue({
            sessionToken: "generated-session-token",
            refreshToken: "generated-refresh-token",
        });

        mockedTransaction.mockImplementation(async (callback: any) => callback({
            refreshToken: { create: txRefreshCreate },
            session: { create: txSessionCreate },
        }));

        await expect(createTokens("emp-1")).resolves.toEqual({
            sessionToken: "new-session-token",
            refreshToken: "new-refresh-token",
        });

        expect(mockedGenerateToken).toHaveBeenCalledWith("emp-1");
        expect(txRefreshCreate).toHaveBeenCalledWith({
            data: {
                employeeId: "emp-1",
                token: "generated-refresh-token",
                expiresAt: expect.any(Date),
            },
        });
        expect(txSessionCreate).toHaveBeenCalledWith({
            data: {
                employeeId: "emp-1",
                token: "generated-session-token",
                expiresAt: expect.any(Date),
            },
        });
    });

    it("throws 500 when transaction fails", async () => {
        mockedTransaction.mockRejectedValue(new Error("db failure"));

        await expect(createTokens("emp-1")).rejects.toMatchObject<HttpError>({
            name: "HttpError",
            status: 500,
            message: "Failed to generate tokens",
        });
    });
});

describe("retrieveTokens()", () => {
    const mockedSessionFindUnique = prisma.session.findUnique as unknown as jest.Mock;
    const mockedRefreshFindUnique = prisma.refreshToken.findUnique as unknown as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns both tokens when they exist", async () => {
        mockedSessionFindUnique.mockResolvedValue({ token: "session-1", isValid: true });
        mockedRefreshFindUnique.mockResolvedValue({ token: "refresh-1", revoked: false });

        await expect(retrieveTokens({ sessionToken: "session-1", refreshToken: "refresh-1" })).resolves.toEqual({
            session: { token: "session-1", isValid: true },
            refresh: { token: "refresh-1", revoked: false },
        });

        expect(mockedSessionFindUnique).toHaveBeenCalledWith({ where: { token: "session-1" } });
        expect(mockedRefreshFindUnique).toHaveBeenCalledWith({ where: { token: "refresh-1" } });
    });

    it("returns empty result when no tokens are provided", async () => {
        await expect(retrieveTokens({})).resolves.toEqual({});
        expect(mockedSessionFindUnique).not.toHaveBeenCalled();
        expect(mockedRefreshFindUnique).not.toHaveBeenCalled();
    });

    it("throws 500 when prisma read fails", async () => {
        mockedSessionFindUnique.mockRejectedValue(new Error("db read failure"));

        await expect(retrieveTokens({ sessionToken: "session-1" })).rejects.toMatchObject<HttpError>({
            name: "HttpError",
            status: 500,
            message: "Failed to retrieve tokens",
        });
    });
});

describe("refreshTokens() error handling", () => {
    const mockedVerify = jwt.verify as unknown as jest.Mock;
    const mockedRefreshUpdate = prisma.refreshToken.update as unknown as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
    });

    it("throws 401 Refresh token expired when jwt.verify throws TokenExpiredError", async () => {
        const tokenExpiredError = new Error("jwt expired");
        tokenExpiredError.name = "TokenExpiredError";
        mockedVerify.mockImplementation(() => {
            throw tokenExpiredError;
        });

        await expect(refreshTokens("old-refresh-token")).rejects.toMatchObject<HttpError>({
            name: "HttpError",
            status: 401,
            message: "Refresh token expired",
        });

        expect(mockedVerify).toHaveBeenCalledWith("old-refresh-token", "test-refresh-secret");
        expect(mockedRefreshUpdate).not.toHaveBeenCalled();
    });

    it("throws 401 Invalid or revoked refresh token for non-expired JWT errors", async () => {
        const invalidTokenError = new Error("invalid token");
        invalidTokenError.name = "JsonWebTokenError";
        mockedVerify.mockImplementation(() => {
            throw invalidTokenError;
        });

        await expect(refreshTokens("bad-refresh-token")).rejects.toMatchObject<HttpError>({
            name: "HttpError",
            status: 401,
            message: "Invalid or revoked refresh token",
        });

        expect(mockedVerify).toHaveBeenCalledWith("bad-refresh-token", "test-refresh-secret");
        expect(mockedRefreshUpdate).not.toHaveBeenCalled();
    });

    it("throws generic 401 when revoke update fails after successful JWT verification", async () => {
        mockedVerify.mockReturnValue({ employeeId: "emp-123" });
        mockedRefreshUpdate.mockRejectedValue(new Error("database unavailable"));

        await expect(refreshTokens("persisted-refresh-token")).rejects.toMatchObject<HttpError>({
            name: "HttpError",
            status: 401,
            message: "Invalid or revoked refresh token",
        });

        expect(mockedRefreshUpdate).toHaveBeenCalledWith({
            where: { token: "persisted-refresh-token" },
            data: {
                revoked: true,
                revokedAt: expect.any(Date),
            },
        });
    });
});

