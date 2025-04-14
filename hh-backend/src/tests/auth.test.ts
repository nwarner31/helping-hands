import request from "supertest";
import app from "../app"; // Ensure this is your Express app instance
import { prismaMock } from "./prismaMock";
import {afterAll, beforeAll} from "@jest/globals";
import {execSync} from "child_process";

import { PrismaClient } from "@prisma/client";
import {registerEmployee} from "../services/auth.service";

const prisma = new PrismaClient();

beforeAll(async () => {
    execSync("npx prisma migrate deploy");
});

beforeEach(async () => {
    await prisma.employee.deleteMany();
})

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Auth Routes - Register", () => {
    beforeEach(() => {

        jest.clearAllMocks(); // Reset mocks before each test
    });

    it("should register an employee and return 201", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                employeeId: "test123",
                name: "John Doe",
                email: "john.doe@example.com",
                password: "StrongPass123",
                confirmPassword: "StrongPass123",
                hireDate: "2024-03-09",
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("message", "Employee registered successfully!");
        expect(response.body).toHaveProperty("accessToken");
        expect(response.body).toHaveProperty("employee");
    });


    describe("POST /auth/register - Field Validation", () => {
        const validEmployee = {
            employeeId: "jdoe31",
            name: "John Doe",
            email: "johndoe@example.com",
            password: "SecurePassword123",
            confirmPassword: "SecurePassword123",
            hireDate: "2024-03-09"
        };

        const requiredFields = ["employeeId", "name", "email", "password", "confirmPassword", "hireDate"];

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
            employeeId: "test123",
            name: "John Doe",
            email: "john.doe@example.com",
            password: "StrongPass123",
            confirmPassword: "StrongPass123",
            hireDate: "2024-03-09",
        }
        const response = await request(app)
            .post("/api/auth/register")
            .send(employee);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("message", "Employee registered successfully!");
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
            employeeId: "test123",
            name: "John Doe",
            email: "john.doe@example.com",
            password: "StrongPass123",
            confirmPassword: "StrongPass123",
            hireDate: "2024-03-09",
        }
        const response = await request(app)
            .post("/api/auth/register")
            .send(employee);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("message", "Employee registered successfully!");
        expect(response.body).toHaveProperty("accessToken");
        expect(response.body).toHaveProperty("employee");

        employee.employeeId = "newtest456";
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
                employeeId: "test123",
                name: "John Doe",
                email: "john.doe@example.com",
                password: "StrongPass123",
                confirmPassword: "StrongPass123",
                hireDate: "2024-03-09",
            });

        expect(response.status).toBe(500);
    });
});
