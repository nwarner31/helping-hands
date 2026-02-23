import prisma from "../../utility/prisma";
import {Employee} from "@prisma/client";
import request from "supertest";
import app from "../../app";
import bcrypt from "bcryptjs";
import {revokeTokens} from "../../services/utility/token.service";


describe("AUTH - Logout", () => {
    const password = "LogoutPass123";

    const employee: Employee = {
        id: "logouttest1",
        name: "Logout Test",
        email: "logout@test.com",
        position: "ASSOCIATE",
        password: "",  // Will be set in beforeAll
        hireDate: new Date("2024-03-09") ,
        sex: "M"
    };
    let token: string;
    const agent = request.agent(app);
    beforeEach(async () => {
        await prisma.refreshToken.deleteMany();
        await prisma.session.deleteMany();
        await prisma.employee.deleteMany();
        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.employee.create({
            data: {
                ...employee,
                password: passwordHash}
        });
        const loginRes = await agent.post("/api/auth/login")
            .send({ email: employee.email, password: password });
        token = loginRes.body.sessionToken;
        expect(loginRes.headers['set-cookie']).toEqual(
            expect.arrayContaining([
                expect.stringContaining('refreshToken='),
            ]));
    });
    afterAll(async () => {
        prisma.$disconnect();
    });

    it("should successfully logout and invalidate the token", async () => {
        console.log(token);
        const logoutRes = await agent.post("/api/auth/logout")
            .set("Authorization", `Bearer ${token}`);
        console.log(logoutRes.body);
        expect(logoutRes.status).toBe(204);
        const rawCookies = logoutRes.headers['set-cookie'];

        const cookies = Array.isArray(rawCookies)
            ? rawCookies
            : rawCookies
                ? [rawCookies]
                : [];

        const refreshCookie = cookies.find(c =>
            c.startsWith('refreshToken=')
        );

        expect(refreshCookie).toMatch(/Max-Age=0|Expires=/);
    });
    it("should not be able to access protected route with logged out token", async () => {
        const logoutRes = await agent.post("/api/auth/logout")
            .set("Authorization", `Bearer ${token}`);
        expect(logoutRes.status).toBe(204);

        const protectedRes = await agent.get("/api/house")
            .set("Authorization", `Bearer ${token}`);
        expect(protectedRes.status).toBe(401);
    });

    it("should return 204 with a refresh token but no session token", async () => {
        const logoutRes = await agent.post("/api/auth/logout");
        expect(logoutRes.status).toBe(204);
    });

    it("should return 204 for session token but no refresh token", async () => {
        const logoutRes = await request(app).post("/api/auth/logout")
            .set("Authorization", `Bearer ${token}`);
        expect(logoutRes.status).toBe(204);
    })

    it("should return 401 with no tokens provided", async () => {
        const logoutRes = await request(app).post("/api/auth/logout");
        expect(logoutRes.status).toBe(401);
    })

    it("should handle server errors and still send 204", async () => {
        jest.spyOn(require("../../services/utility/token.service"), "revokeTokens")
            .mockRejectedValue(new Error("Database connection failed"));
        const logoutRes = await agent.post("/api/auth/logout")
            .set("Authorization", `Bearer ${token}`);
        expect(logoutRes.status).toBe(204);
    })
});