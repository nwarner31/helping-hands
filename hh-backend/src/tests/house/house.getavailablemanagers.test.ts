import prisma from "../../utility/prisma";
import request from "supertest";
import app from "../../app";
import { setupHouseTest, teardownHouseTests } from "./house.setuptest";
import * as houseService from "../../services/house.service";

describe("HOUSE - get available managers for a house", () => {
    let directorToken: string;
    let adminToken: string;
    let associateToken: string;
    let houseId: string;

    beforeAll(async () => {
        const tokens = await setupHouseTest();
        directorToken = tokens.directorToken;
        adminToken = tokens.adminToken;
        associateToken = tokens.associateToken;
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                id: "testmanager1",
                name: "John Doe",
                email: "manager@test.com",
                password: "StrongPass123",
                confirmPassword: "StrongPass123",
                hireDate: "2024-03-09",
                position: "MANAGER",
                sex: "M"
            });
        const response2 = await request(app)
            .post("/api/auth/register")
            .send({
                id: "testmanager2",
                name: "John Doe",
                email: "manager2@test.com",
                password: "StrongPass123",
                confirmPassword: "StrongPass123",
                hireDate: "2024-03-09",
                position: "MANAGER",
                sex: "M"
            });

        const house = await prisma.house.create({
            data: {
                id: "H1234",
                name: "Testtopia",
                street1: "123 Test Loop",
                city: "Seattle",
                state: "WA",
                maxClients: 2,
                femaleEmployeeOnly: false
            }
        });
        houseId = house.id;
    });

    afterAll(async () => {
        await teardownHouseTests();
    });

    it("should return 200 and available managers for ADMIN or DIRECTOR", async () => {
        const res = await request(app)
            .get(`/api/house/${houseId}/available-managers`)
            .set("Authorization", `Bearer ${directorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("available mangers found");
        console.log(res.body);
        expect(res.body.managers.length).toEqual(2);
        expect(res.body.managers[0].id).toEqual("testmanager1");
        expect(res.body.managers[1].id).toEqual("testmanager2");
    });

    it("should return 401 if no token provided", async () => {
        const res = await request(app)
            .get(`/api/house/${houseId}/available-managers`);

        expect(res.status).toBe(401);
    });

    it("should return 403 if user does not have required position", async () => {
        const res = await request(app)
            .get(`/api/house/${houseId}/available-managers`)
            .set("Authorization", `Bearer ${associateToken}`);

        expect(res.status).toBe(403);
    });

    it("should handle service errors", async () => {
        jest.spyOn(houseService, "getAvailableManagers").mockRejectedValue(new Error("DB failure"));

        const res = await request(app)
            .get(`/api/house/${houseId}/available-managers`)
            .set("Authorization", `Bearer ${directorToken}`);

        expect(res.status).toBe(500);
    });
});
