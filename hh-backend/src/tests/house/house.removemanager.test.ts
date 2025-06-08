import request from "supertest";
import {Employee} from "@prisma/client";
import {setupHouseTest, teardownHouseTests} from "./house.setuptest";
import app from "../../app";
import prisma from "../../utility/prisma";

describe("DELETE /house/:houseId/manager/:managerId", () => {
    let directorToken: string;
    let manager: Employee | null = null;

    beforeAll(async () => {
        const tokens = await setupHouseTest();
        directorToken = tokens.directorToken;

        const response = await request(app).post("/api/auth/register").send({
            id: "mgr200",
            name: "Manager M",
            email: "manager200@test.com",
            password: "StrongPass123",
            confirmPassword: "StrongPass123",
            hireDate: "2024-03-09",
            position: "MANAGER",
            sex: "M"
        });
        manager = response.body.employee;
    });

    beforeEach(async () => {
        await prisma.house.deleteMany();
        await request(app).post("/api/house")
            .set("Authorization", `Bearer ${directorToken}`)
            .send({
                id: "H2002",
                name: "Test House",
                street1: "2 Example Rd",
                city: "Testville",
                state: "TX",
                maxClients: 2,
                femaleEmployeeOnly: false,
            });

        // Assign as primary manager
        await request(app)
            .post("/api/house/H2002/manager")
            .set("Authorization", `Bearer ${directorToken}`)
            .send({ employeeId: "mgr200", positionType: "primary" });
    });

    afterAll(async () => {
        await teardownHouseTests();
    });

    it("should remove the primary manager from the house", async () => {
        const res = await request(app)
            .delete("/api/house/H2002/manager/mgr200")
            .set("Authorization", `Bearer ${directorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("manager removed from house");
        expect(res.body.house.primaryHouseManager).toBeNull();
    });

    it("should return 400 for a non-existent house", async () => {
        const res = await request(app)
            .delete("/api/house/INVALID123/manager/mgr200")
            .set("Authorization", `Bearer ${directorToken}`);

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual({ houseId: "House ID does not exist" });
    });

    it("should return 400 for a non-existent manager", async () => {
        const res = await request(app)
            .delete("/api/house/H2002/manager/invalidMgr")
            .set("Authorization", `Bearer ${directorToken}`);

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
            .set("Authorization", `Bearer ${directorToken}`);

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
        const tokens = await setupHouseTest();
        const res = await request(app)
            .delete("/api/house/H2002/manager/mgr200")
            .set("Authorization", `Bearer ${tokens.associateToken}`);

        expect(res.status).toBe(403);
    });

    it("should handle unexpected service error", async () => {
        jest.spyOn(require("../../services/house.service"), "removeHouseManager")
            .mockRejectedValueOnce(new Error("DB failure"));

        const res = await request(app)
            .delete("/api/house/H2002/manager/mgr200")
            .set("Authorization", `Bearer ${directorToken}`);

        expect(res.status).toBe(500);
    });
});
