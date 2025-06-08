import request from "supertest";
import app from "../app"; // Ensure this is your Express app instance
import {afterAll, beforeAll} from "@jest/globals";
import {execSync} from "child_process";

import prisma from "../utility/prisma";



afterAll(async () => {
    await prisma.$disconnect();
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe("Auth Routes - Register", () => {
    beforeEach(async () => {
        await prisma.employee.deleteMany();
        jest.clearAllMocks(); // Reset mocks before each test
    });

    it("should register an employee and return 201", async () => {
        //await prisma.employee.deleteMany();
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                id: "test123",
                name: "John Doe",
                email: "john.doe@example.com",
                password: "StrongPass123",
                confirmPassword: "StrongPass123",
                hireDate: "2024-03-09",
                sex: "M"
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("message", "Employee registered successfully");
        expect(response.body).toHaveProperty("accessToken");
        expect(response.body).toHaveProperty("employee");
    });


    describe("POST /auth/register - Field Validation", () => {
        const validEmployee = {
            id: "jdoe31",
            name: "John Doe",
            email: "johndoe@example.com",
            password: "SecurePassword123",
            confirmPassword: "SecurePassword123",
            hireDate: "2024-03-09"
        };

        const requiredFields = ["id", "name", "email", "password", "confirmPassword", "hireDate"];

        requiredFields.forEach((field) => {
            it(`should return 400 when '${field}' is missing`, async () => {
                const invalidData = { ...validEmployee };
                delete invalidData[field as keyof typeof validEmployee];  // Remove the field

                const response = await request(app)
                    .post("/api/auth/register")
                    .send(invalidData);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty("message");
                expect(response.body.message).toHaveProperty(field);
            });
        });

        it('should return 400 for improperly formatted email', async () => {
            const invalidData = { ...validEmployee, email: "thisisntanemail"};
            const response = await request(app)
                .post("/api/auth/register")
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
            expect(response.body.message).toHaveProperty("email");
        });
        it('should return 400 for a password less than 8 characters', async () => {
            const invalidData = { ...validEmployee, password: "test", confirmPassword: "test"};
            const response = await request(app)
                .post("/api/auth/register")
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
            expect(response.body.message).toHaveProperty("password");
        });
        it('should return 400 for an improperly formatted date', async () => {
            const invalidData = { ...validEmployee, hireDate: "notavaliddate"};
            const response = await request(app)
                .post("/api/auth/register")
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
            expect(response.body.message).toHaveProperty("hireDate");
        });
        it('should return 400 for passwords that do not match', async () => {
            const invalidData = { ...validEmployee, confirmPassword: "Iamapassword"};
            const response = await request(app)
                .post("/api/auth/register")
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
            expect(response.body.message).toHaveProperty("confirmPassword");
        });
    });

    it("should return 500 for a duplicate employee id", async () => {
        const employee = {
            id: "test123",
            name: "John Doe",
            email: "john.doe@example.com",
            password: "StrongPass123",
            confirmPassword: "StrongPass123",
            hireDate: "2024-03-09",
            sex: "M"
        }
        const response = await request(app)
            .post("/api/auth/register")
            .send(employee);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("message", "Employee registered successfully");
        expect(response.body).toHaveProperty("accessToken");
        expect(response.body).toHaveProperty("employee");

        employee.email = "mytest@mail.com";
        const invalidResponse = await request(app)
            .post("/api/auth/register")
            .send(employee);
        expect(invalidResponse.status).toBe(500);
    })


    it("should return 500 for a duplicate email", async () => {
        const employee = {
            id: "test123",
            name: "John Doe",
            email: "john.doe@example.com",
            password: "StrongPass123",
            confirmPassword: "StrongPass123",
            hireDate: "2024-03-09",
            sex: "M"
        }
        const response = await request(app)
            .post("/api/auth/register")
            .send(employee);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("message", "Employee registered successfully");
        expect(response.body).toHaveProperty("accessToken");
        expect(response.body).toHaveProperty("employee");

        employee.id = "newtest456";
        const invalidResponse = await request(app)
            .post("/api/auth/register")
            .send(employee);
        expect(invalidResponse.status).toBe(500);
    })

    it("should handle server errors", async () => {
        //(registerEmployee as jest.Mock).mockRejectedValue(new Error("Database connection failed"));
        jest.spyOn(require("../../src/services/auth.service"), "registerEmployee")
            .mockRejectedValue(new Error("Database connection failed"));
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                id: "test123",
                name: "John Doe",
                email: "john.doe@example.com",
                password: "StrongPass123",
                confirmPassword: "StrongPass123",
                hireDate: "2024-03-09",
                sex: "M"
            });

        expect(response.status).toBe(500);
    });
});

describe("Auth Routes - Login", () => {
    beforeAll(async () => {
        await prisma.employee.deleteMany();
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                id: "test123",
                name: "John Doe",
                email: "john.doe@example.com",
                password: "StrongPass123",
                confirmPassword: "StrongPass123",
                hireDate: "2024-03-09",
                sex: "M"
            });
        if (response.statusCode !== 201) {
            console.log(response);
            throw new Error("Error setting up user to login as");
        }
    });
    it("should login the user if the correct credentials are provided", async () => {
        const login = {email: "john.doe@example.com", password: "StrongPass123"};
        const response = await request(app)
            .post("/api/auth/login")
            .send(login);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Login successful");
        expect(response.body).toHaveProperty("accessToken");
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
        jest.spyOn(require("../../src/services/auth.service"), "loginEmployee")
            .mockRejectedValue(new Error("Database connection failed"));
        const response = await request(app)
            .post("/api/auth/login")
            .send( {email: "john.doe@example.com", password: "StrongPass123"});

        expect(response.status).toBe(500);
    });
})
