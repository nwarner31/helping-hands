import {beforeAll} from "@jest/globals";
import prisma from "../../utility/prisma";
import request from "supertest";
import app from "../../app";


describe("Auth Routes - Login", () => {
    beforeAll(async () => {
        await prisma.session.deleteMany();
        await prisma.refreshToken.deleteMany();
        await prisma.employee.deleteMany();
        const passwordHash = await require("bcryptjs").hash("StrongPass123", 10);
        await prisma.employee.create({
            data: {
                id: "test123",
                name: "John Doe",
                email: "john.doe@example.com",
                position: "ASSOCIATE",
                password: passwordHash,
                hireDate: new Date("2024-03-09"),
                sex: "M"
        }});
    });
    afterAll(async () => {
        jest.clearAllMocks();
        await prisma.$disconnect();
    });
    it("should login the user if the correct credentials are provided", async () => {
        const login = {email: "john.doe@example.com", password: "StrongPass123"};
        const response = await request(app)
            .post("/api/auth/login")
            .send(login);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Login successful");
        expect(response.body).toHaveProperty("sessionToken");
        expect(response.body).toHaveProperty("employee");

    });
    it("should return 400 for no email", async () => {
        const login = {password: "StrongPass123"};
        const response = await request(app)
            .post("/api/auth/login")
            .send(login);
        expect(response.status).toBe(400);
    });
    it("should return 400 for no password", async () => {
        const login = {email: "john.doe@example.com"};
        const response = await request(app)
            .post("/api/auth/login")
            .send(login);
        expect(response.status).toBe(400);
    });
    it("should return 400 for incorrect formatted email", async () => {
        const login = {email: "john.doe", password: "StrongPass123"};
        const response = await request(app)
            .post("/api/auth/login")
            .send(login);
        expect(response.status).toBe(400);
    });
    it("should return 400 for bad email", async () => {
        const login = {email: "john.doe@test.com", password: "StrongPass123"};
        const response = await request(app)
            .post("/api/auth/login")
            .send(login);
        expect(response.status).toBe(400);
    });
    it("should return 400 for bad password", async () => {
        const login = {email: "john.doe@example.com", password: "OtherPass123"};
        const response = await request(app)
            .post("/api/auth/login")
            .send(login);
        expect(response.status).toBe(400);
    });
    it("should handle server errors", async () => {
        jest.spyOn(require("../../../src/services/auth.service"), "loginEmployee")
            .mockRejectedValue(new Error("Database connection failed"));
        const response = await request(app)
            .post("/api/auth/login")
            .send( {email: "john.doe@example.com", password: "StrongPass123"});

        expect(response.status).toBe(500);
    });
})