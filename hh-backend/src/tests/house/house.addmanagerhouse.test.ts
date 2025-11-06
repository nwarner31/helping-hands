import request from "supertest";
import app from "../../app"; // Your Express app
//import * as houseService from "../../services/house.service"; // Where addHouseManager is
import { HttpError } from "../../utility/httperror";
import {setupHouseTest, teardownHouseTests} from "./house.setuptest";
import prisma from "../../utility/prisma";
import {Employee} from "@prisma/client";
import {TestEmployee} from "../setuptestemployees";
import {setupTestManagers} from "../setuptestmanagers";

// Mock service
//jest.mock("../../services/houseService");

describe("POST /house/:houseId/manager", () => {
    let director: TestEmployee;
    let associate: TestEmployee;
    let manager1: TestEmployee;
    let manager2: TestEmployee;
    let manager3: TestEmployee;
    const mockHouse = {
        id: "H1001",
        name: "Harmony Home",
        street1: "1 Peaceful Way",
        city: "Calmville",
        state: "WA",
        maxClients: 2,
        femaleEmployeeOnly: false,

    };
    let manager: Employee | null = null;
    beforeAll(async () => {
        const employees = await setupHouseTest();
        director = employees.director;
        associate = employees.associate;
        const managers = await setupTestManagers();
        ({manager1, manager2, manager3} = managers);
    })


    beforeEach(async () => {
        await prisma.house.deleteMany();
        await prisma.house.create({
            data: {
                id: "H2002",
                name: "Test House",
                street1: "2 Example Rd",
                city: "Testville",
                state: "TX",
                maxClients: 2,
                femaleEmployeeOnly: false,
                primaryManagerId: null,
                secondaryManagerId: null,
            }
        })
        jest.clearAllMocks();
    });
    afterAll(async () => {
        await teardownHouseTests();
    })

    it("should add a primary manager to a house", async () => {
        const response = await request(app)
            .post("/api/house/H2002/manager")
            .set("Authorization", `Bearer ${director.token}`)
            .send({ employeeId: manager1.id, positionType: "primary" });
        expect(response.status).toBe(200);
        expect(response.body.house.primaryManagerId).toEqual(manager1.id);
    });

    it("should add a secondary manager to a house", async () => {
        const response = await request(app)
            .post("/api/house/H2002/manager")
            .set("Authorization", `Bearer ${director.token}`)
            .send({ employeeId: manager2.id, positionType: "secondary" });
        expect(response.status).toBe(200);
        expect(response.body.house.secondaryManagerId).toEqual(manager2.id);

    });

    it("should not allow adding the same manager as primary and secondary", async () => {
        // First, add as primary
        let response = await request(app)
            .post("/api/house/H2002/manager")
            .set("Authorization", `Bearer ${director.token}`)
            .send({ employeeId: manager3.id, positionType: "primary" });
        expect(response.status).toBe(200);
        expect(response.body.house.primaryManagerId).toEqual(manager3.id);

        // Then, try to add the same manager as secondary
        response = await request(app)
            .post("/api/house/H2002/manager")
            .set("Authorization", `Bearer ${director.token}`)
            .send({ employeeId: manager3.id, positionType: "secondary" });
        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual({
            employeeId: "Employee is already a manager in the house"
        });

    })

    it("should reject invalid positionType", async () => {
        const response = await request(app)
            .post("/api/house/H1001/manager")
            .set("Authorization", `Bearer ${director.token}`)
            .send({ employeeId: "testabc", positionType: "invalid" });

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual({
            positionType: "invalid position type",
        });
 });
    it("should reject invalid house id", async () => {
        const response = await request(app)
            .post("/api/house/H2231/manager")
            .set("Authorization", `Bearer ${director.token}`)
            .send({ employeeId: "testabc", positionType: "primary" });

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual({
            houseId: "House ID does not exist",
        });
    });
    it("should reject an invalid employee id", async () => {
        const response = await request(app)
            .post("/api/house/H2002/manager")
            .set("Authorization", `Bearer ${director.token}`)
            .send({ employeeId: "hello", positionType: "primary" });

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual({
            employeeId: "Employee does not exist or is not a manager"
        });
    });
    it("should reject a non manager employee id", async () => {
        const response = await request(app)
            .post("/api/house/H2002/manager")
            .set("Authorization", `Bearer ${director.token}`)
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
            .set("Authorization", `Bearer ${associate.token}`)
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
            .set("Authorization", `Bearer ${director.token}`)
            .send({ employeeId: "testabc", positionType: "secondary" });
        expect(response.status).toBe(500);
    });
});
