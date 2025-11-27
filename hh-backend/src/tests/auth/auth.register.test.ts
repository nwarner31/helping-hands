import request from "supertest";
import app from "../../app"; // Ensure this is your Express app instance
import {afterAll, beforeAll} from "@jest/globals";

import prisma from "../../utility/prisma";


describe("Auth Routes - Register", () => {
    beforeEach(async () => {
        await prisma.session.deleteMany();
        await prisma.refreshToken.deleteMany();
        await prisma.employee.deleteMany();
        jest.clearAllMocks(); // Reset mocks before each test
    });
    afterAll(async () => {
        jest.clearAllMocks();
        await prisma.$disconnect();
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
        expect(response.body).toHaveProperty("sessionToken");
        expect(response.body).toHaveProperty("employee");
    });


    describe("POST /auth/register - Field Validation", () => {
        const validEmployee = {
            id: "jdoe31",
            name: "John Doe",
            email: "johndoe@example.com",
            password: "SecurePassword123",
            confirmPassword: "SecurePassword123",
            hireDate: "2024-03-09",
            sex: "M"
        };

        const requiredFields = ["id", "name", "email", "password", "confirmPassword", "hireDate", "sex"];

        requiredFields.forEach((field) => {
            it(`should return 400 when '${field}' is missing`, async () => {
                const invalidData = { ...validEmployee };
                delete invalidData[field as keyof typeof validEmployee];  // Remove the field

                const response = await request(app)
                    .post("/api/auth/register")
                    .send(invalidData);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty("message");
                expect(response.body.errors).toHaveProperty(field);
            });
        });

        it('should return 400 for improperly formatted email', async () => {
            const invalidData = { ...validEmployee, email: "thisisntanemail"};
            const response = await request(app)
                .post("/api/auth/register")
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
            expect(response.body.errors).toHaveProperty("email");
        });
        it('should return 400 for a password less than 8 characters', async () => {
            const invalidData = { ...validEmployee, password: "test", confirmPassword: "test"};
            const response = await request(app)
                .post("/api/auth/register")
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
            expect(response.body.errors).toHaveProperty("password");
        });
        it('should return 400 for an improperly formatted date', async () => {
            const invalidData = { ...validEmployee, hireDate: "notavaliddate"};
            const response = await request(app)
                .post("/api/auth/register")
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
            expect(response.body.errors).toHaveProperty("hireDate");
        });
        it('should return 400 for passwords that do not match', async () => {
            const invalidData = { ...validEmployee, confirmPassword: "Iamapassword"};
            const response = await request(app)
                .post("/api/auth/register")
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
            expect(response.body.errors).toHaveProperty("confirmPassword");
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
        expect(response.body).toHaveProperty("sessionToken");
        expect(response.body).toHaveProperty("employee");

        employee.email = "mytest@mail.com";
        const invalidResponse = await request(app)
            .post("/api/auth/register")
            .send(employee);
        expect(invalidResponse.status).toBe(400);
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
        expect(response.body).toHaveProperty("sessionToken");
        expect(response.body).toHaveProperty("employee");

        employee.id = "newtest456";
        const invalidResponse = await request(app)
            .post("/api/auth/register")
            .send(employee);
        expect(invalidResponse.status).toBe(400);
    })

    it("should handle server errors", async () => {
        //(registerEmployee as jest.Mock).mockRejectedValue(new Error("Database connection failed"));
        jest.spyOn(require("../../../src/services/auth.service"), "registerEmployee")
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