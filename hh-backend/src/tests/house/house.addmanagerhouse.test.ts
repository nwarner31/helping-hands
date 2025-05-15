import request from "supertest";
import app from "../../app"; // Your Express app
//import * as houseService from "../../services/house.service"; // Where addHouseManager is
import { HttpError } from "../../utility/httperror";
import {setupHouseTest, teardownHouseTests} from "./house.setuptest";
import prisma from "../../utility/prisma";
import {Employee} from "@prisma/client";

// Mock service
//jest.mock("../../services/houseService");

describe("POST /house/:houseId/manager", () => {
    let directorToken: string;
    let associateToken: string;
    const mockHouse = {
        houseId: "H1001",
        name: "Harmony Home",
        street1: "1 Peaceful Way",
        city: "Calmville",
        state: "WA",
        maxClients: 2,
        femaleEmployeeOnly: false,

    };
    let manager: Employee | null = null;
    beforeAll(async () => {
        const tokens = await setupHouseTest();
        directorToken = tokens.directorToken;
        associateToken = tokens.associateToken;
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                employeeId: "testabc",
                name: "John Doe",
                email: "manager@test.com",
                password: "StrongPass123",
                confirmPassword: "StrongPass123",
                hireDate: "2024-03-09",
                position: "MANAGER"
            });
        manager = response.body.employee;
    })


    beforeEach(async () => {
        await prisma.house.deleteMany();
        await request(app).post("/api/house")
        .set("Authorization", `Bearer ${directorToken}`)
        .send(mockHouse);
        jest.clearAllMocks();
    });
    afterAll(async () => {
        await teardownHouseTests();
    })

    it("should add a primary manager to a house", async () => {
        const response = await request(app)
            .post("/api/house/H1001/manager")
            .set("Authorization", `Bearer ${directorToken}`)
            .send({ employeeId: "testabc", positionType: "primary" });

        expect(response.status).toBe(209);
        expect(response.body.house.primaryManagerId).toEqual(manager?.id);
    });

    it("should reject invalid positionType", async () => {
        const response = await request(app)
            .post("/api/house/H1001/manager")
            .set("Authorization", `Bearer ${directorToken}`)
            .send({ employeeId: "testabc", positionType: "invalid" });

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual({
            positionType: "invalid position type",
        });
 });
    it("should reject invalid house id", async () => {
        const response = await request(app)
            .post("/api/house/H2231/manager")
            .set("Authorization", `Bearer ${directorToken}`)
            .send({ employeeId: "testabc", positionType: "primary" });

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual({
            houseId: "House ID does not exist",
        });
    });
    it("should reject an invalid employee id", async () => {
        const response = await request(app)
            .post("/api/house/H1001/manager")
            .set("Authorization", `Bearer ${directorToken}`)
            .send({ employeeId: "hello", positionType: "primary" });

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual({
            employeeId: "Employee does not exist or is not a manager"
        });
    });
    it("should reject a non manager employee id", async () => {
        const response = await request(app)
            .post("/api/house/H1001/manager")
            .set("Authorization", `Bearer ${directorToken}`)
            .send({ employeeId: "test789", positionType: "primary" });

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual({
            employeeId: "Employee does not exist or is not a manager"
        });
    });
    it("should return a 401 if no token provided", async () => {
        const response = await request(app)
            .post("/api/house/H1001/manager")
            .send({ employeeId: "testabc", positionType: "primary" });

        expect(response.status).toBe(401);
    });

    it("should return 403 for an associate", async () => {
        const response = await request(app)
            .post("/api/house/H1001/manager")
            .set("Authorization", `Bearer ${associateToken}`)
            .send({ employeeId: "testabc", positionType: "primary" });

        expect(response.status).toBe(403);
    })

    it("should handle service errors correctly", async () => {
        const error = new HttpError(400, "invalid input", {
            employeeId: "Not found",
        });
        jest.spyOn(require("../../services/house.service"), "addHouseManager")
            .mockRejectedValue(new Error("Database connection failed"));

        const response = await request(app)
            .post("/api/house/H1001/manager")
            .set("Authorization", `Bearer ${directorToken}`)
            .send({ employeeId: "testabc", positionType: "secondary" });
        expect(response.status).toBe(500);
    });
});
