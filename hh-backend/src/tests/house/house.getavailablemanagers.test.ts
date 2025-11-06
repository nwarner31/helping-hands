import prisma from "../../utility/prisma";
import request from "supertest";
import app from "../../app";
import { setupHouseTest, teardownHouseTests } from "./house.setuptest";
import * as houseService from "../../services/house.service";
import {TestEmployee} from "../setuptestemployees";

describe("HOUSE - get available managers for a house", () => {
    let director: TestEmployee;
    let admin: TestEmployee;
    let associate: TestEmployee;
    let houseId: string;

    const managerIds = ["testmanager1", "testmanager2"];

    beforeAll(async () => {
        const employees = await setupHouseTest();
        director = employees.director;
        admin = employees.admin;
        associate = employees.associate;
    });


    beforeEach(async () => {
        await prisma.house.deleteMany();
        await prisma.employee.deleteMany({ where: { position: "MANAGER" } });

        await prisma.employee.createMany({
            data: [
                {
                id: managerIds[0],
                name: "John Doe",
                email: "manager@test.com",
                password: "StrongPass123",
                hireDate: new Date("2024-03-09"),
                position: "MANAGER",
                sex: "M"
            },
        {
                id: managerIds[1],
                name: "John Doe",
                email: "manager2@test.com",
                password: "StrongPass123",
                hireDate: new Date("2024-03-09"),
                position: "MANAGER",
                sex: "M"
            }]});

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
            .set("Authorization", `Bearer ${director.token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("available mangers found");
        console.log(res.body);
        expect(res.body.managers.length).toEqual(2);
        expect(res.body.managers[0].id).toEqual(managerIds[0]);
        expect(res.body.managers[1].id).toEqual(managerIds[1]);
    });

    it("should return 401 if no token provided", async () => {
        const res = await request(app)
            .get(`/api/house/${houseId}/available-managers`);

        expect(res.status).toBe(401);
    });

    it ("should return 400 if houseId is missing", async () => {
        const res = await request(app)
            .get("/api/house/%20/available-managers")
            .set("Authorization", `Bearer ${director.token}`);

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual({ houseId: "House ID is required" });
    })

    it("should return 400 for a non-existent house", async () => {
        const res = await request(app)
            .get("/api/house/INVALID123/available-managers")
            .set("Authorization", `Bearer ${director.token}`);

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual({ houseId: "House ID not found" });
    })

    it("should return 403 if user does not have required position", async () => {
        const res = await request(app)
            .get(`/api/house/${houseId}/available-managers`)
            .set("Authorization", `Bearer ${associate.token}`);

        expect(res.status).toBe(403);
    });

    it("should handle service errors", async () => {
        jest.spyOn(houseService, "getAvailableManagers").mockRejectedValue(new Error("DB failure"));

        const res = await request(app)
            .get(`/api/house/${houseId}/available-managers`)
            .set("Authorization", `Bearer ${director.token}`);

        expect(res.status).toBe(500);
    });
});
