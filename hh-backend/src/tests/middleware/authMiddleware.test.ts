import prisma from "../../utility/prisma";
import { Employee } from "@prisma/client";
import request from "supertest";
import app from "../../app";
import bcrypt from "bcryptjs";

describe("AUTH Middleware - authenticateToken", () => {
    const password = "TestPass123";
    let employee: Employee;
    let sessionToken: string;
    let refreshCookie: string;

    beforeAll(async () => {

        await prisma.employee.deleteMany();

        const passwordHash = await bcrypt.hash(password, 10);
        employee = await prisma.employee.create({
            data: {
                id: "authTest1",
                name: "Auth Test",
                email: "auth@test.com",
                position: "ASSOCIATE",
                password: passwordHash,
                hireDate: new Date(),
                sex: "M",
            },
        });
    });

    beforeEach(async () => {
        await prisma.refreshToken.deleteMany();
        await prisma.session.deleteMany();
        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({ email: employee.email, password });

        sessionToken = loginRes.body.sessionToken;

        const setCookieHeader = loginRes.headers["set-cookie"];
        expect(setCookieHeader).toBeDefined();

        const cookiesArray = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
        const cookie = cookiesArray.find((c: string) => c.startsWith("refreshToken"));
        expect(cookie).toBeDefined();
        refreshCookie = cookie!;
    });

    afterEach(async () => {
        await prisma.session.deleteMany();
        await prisma.refreshToken.deleteMany();
    });

    afterAll(async () => {

        await prisma.employee.deleteMany();
    });

    it("allows access with valid session token", async () => {
        const res = await request(app)
            .get("/api/house") // protected route
            .set("Authorization", `Bearer ${sessionToken}`)
            .set("Cookie", refreshCookie);

        expect(res.status).toBe(200);
    });

    it("refreshes tokens when session token is expired but refresh token is valid", async () => {
        // Expire the session manually
        await prisma.session.updateMany({
            where: { token: sessionToken },
            data: { expiresAt: new Date(Date.now() - 10000) }, // expired 10 sec ago
        });

        const res = await request(app)
            .get("/api/house")
            .set("Authorization", `Bearer ${sessionToken}`)
            .set("Cookie", refreshCookie);

        expect(res.status).toBe(200);
        expect(res.headers["x-session-token"]).toBeDefined();

        const setCookieHeader = res.headers["set-cookie"];
        expect(setCookieHeader).toBeDefined(); // make sure cookie exists

        const cookiesArray = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
        const newRefresh = cookiesArray.find((c: string) => c.startsWith("refreshToken"));
        expect(newRefresh).toBeDefined();
    });

    it("returns 401 when both session and refresh tokens are invalid", async () => {
        // Revoke refresh token
        await prisma.refreshToken.updateMany({
            where: {},
            data: { revoked: true },
        });

        // Expire session too
        await prisma.session.updateMany({
            where: {},
            data: { isValid: false },
        });

        const res = await request(app)
            .get("/api/house")
            .set("Authorization", `Bearer ${sessionToken}`)
            .set("Cookie", refreshCookie);

        expect(res.status).toBe(401);
    });

    it("returns 401 when no tokens are provided", async () => {
        const res = await request(app).get("/api/house");
        expect(res.status).toBe(401);
    });

    it("returns 403 for malformed session JWT", async () => {
        const res = await request(app)
            .get("/api/house")
            .set("Authorization", "Bearer not-a-real-jwt")
            //.set("Cookie", refreshCookie);

        expect(res.status).toBe(403);
    });
    it("should return 500 if database error occurs", async () => {
        jest.spyOn(require("../../services/utility/token.service"), "retrieveTokens")
            .mockRejectedValue(new Error("DB failure"));
        const res = await request(app)
            .get("/api/house")
            .set("Authorization", `Bearer ${sessionToken}`);
        expect(res.status).toBe(500);
    })
});