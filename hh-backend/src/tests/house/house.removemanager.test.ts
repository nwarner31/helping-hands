import request from "supertest";

import {setupHouseTest, teardownHouseTests} from "./house.setuptest";
import app from "../../app";
import prisma from "../../utility/prisma";
import {TestEmployee} from "../setuptestemployees";
import {setupTestManagers} from "../setuptestmanagers";

describe("DELETE /house/:houseId/manager/:managerId", () => {
    let director: TestEmployee;
    let associate: TestEmployee;
    let manager1: TestEmployee;
    let manager2: TestEmployee;
    let manager3: TestEmployee;

    beforeAll(async () => {
        const employees = await setupHouseTest();
        director = employees.director;
        associate = employees.associate;
        const managers = await setupTestManagers();
        ({manager1, manager2, manager3} = managers);
    });

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
                primaryManagerId: manager1.id,
                secondaryManagerId: manager2.id,
            }
        })
        // await request(app).post("/api/house")
        //     .set("Authorization", `Bearer ${director.token}`)
        //     .send({
        //         id: "H2002",
        //         name: "Test House",
        //         street1: "2 Example Rd",
        //         city: "Testville",
        //         state: "TX",
        //         maxClients: 2,
        //         femaleEmployeeOnly: false,
        //     });
        //
        // // Assign as primary manager
        // await request(app)
        //     .post("/api/house/H2002/manager")
        //     .set("Authorization", `Bearer ${director.token}`)
        //     .send({ employeeId: "mgr200", positionType: "primary" });
    });

    afterAll(async () => {
        await teardownHouseTests();
    });

    it("should remove the primary manager from the house", async () => {
        const res = await request(app)
            .delete(`/api/house/H2002/manager/${manager1.id}`)
            .set("Authorization", `Bearer ${director.token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("manager removed from house");
        expect(res.body.house.primaryHouseManager).toBeNull();
    });

    it("should remove the secondary manager from the house", async () => {
        const res = await request(app)
            .delete(`/api/house/H2002/manager/${manager2.id}`)
            .set("Authorization", `Bearer ${director.token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("manager removed from house");
        expect(res.body.house.secondaryHouseManager).toBeNull();
    })

    it("should return 400 for a non-existent house", async () => {
        const res = await request(app)
            .delete("/api/house/INVALID123/manager/mgr200")
            .set("Authorization", `Bearer ${director.token}`);

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual({ houseId: "House ID does not exist" });
    });

    it("should return 400 for a non-existent manager", async () => {
        const res = await request(app)
            .delete("/api/house/H2002/manager/invalidMgr")
            .set("Authorization", `Bearer ${director.token}`);

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual({ managerId: "Manager ID does not exist" });
    });

    it("should return 400 if manager is not assigned to house", async () => {
        // register another manager
        await request(app).post("/api/auth/register").send({
            id: "mgr201",
            name: "Unassigned M",
            email: "manager201@test.com",
            password: "StrongPass123",
            confirmPassword: "StrongPass123",
            hireDate: "2024-03-09",
            position: "MANAGER",
            sex: "M"
        });

        const res = await request(app)
            .delete("/api/house/H2002/manager/mgr201")
            .set("Authorization", `Bearer ${director.token}`);

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual({
            employeeId: "Employee is not a manager in the house",
        });
    });

    it("should return 401 if token is missing", async () => {
        const res = await request(app)
            .delete("/api/house/H2002/manager/mgr200");

        expect(res.status).toBe(401);
    });

    it("should return 403 if unauthorized role (e.g., associate) tries", async () => {
        const res = await request(app)
            .delete("/api/house/H2002/manager/mgr200")
            .set("Authorization", `Bearer ${associate.token}`);

        expect(res.status).toBe(403);
    });

    it("should handle unexpected service error", async () => {
        jest.spyOn(require("../../services/house.service"), "removeHouseManager")
            .mockRejectedValueOnce(new Error("DB failure"));

        const res = await request(app)
            .delete("/api/house/H2002/manager/mgr200")
            .set("Authorization", `Bearer ${director.token}`);

        expect(res.status).toBe(500);
    });
});
