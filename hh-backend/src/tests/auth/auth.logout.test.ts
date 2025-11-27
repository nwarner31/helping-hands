import prisma from "../../utility/prisma";
import {Employee} from "@prisma/client";
import request from "supertest";
import app from "../../app";
import bcrypt from "bcryptjs";


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
        const loginRes = await request(app).post("/api/auth/login")
            .send({ email: employee.email, password: password });
        token = loginRes.body.sessionToken;
    });
    afterAll(async () => {
        prisma.$disconnect();
    });

    it("should successfully logout and invalidate the token", async () => {
        console.log(token);
        const logoutRes = await request(app).post("/api/auth/logout")
            .set("Authorization", `Bearer ${token}`);
        console.log(logoutRes.body);
        expect(logoutRes.status).toBe(204);
        //expect(logoutRes.body.message).toBe("Logout successful");
        expect(logoutRes.headers["refreshToken"]).toBeUndefined();
    });
    it("should not be able to access protected route with logged out token", async () => {
        const logoutRes = await request(app).post("/api/auth/logout")
            .set("Authorization", `Bearer ${token}`);
        expect(logoutRes.status).toBe(204);

        const protectedRes = await request(app).get("/api/house")
            .set("Authorization", `Bearer ${token}`);
        expect(protectedRes.status).toBe(401);
    })
});