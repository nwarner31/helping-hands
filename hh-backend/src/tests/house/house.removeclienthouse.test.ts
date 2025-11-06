import request from "supertest";
import app from "../../app"; // Your Express app
import prisma from "../../utility/prisma"; // Your Prisma client
import{ setupHouseTest, teardownHouseTests } from "./house.setuptest";
import {TestEmployee} from "../setuptestemployees";

describe("DELETE /api/house/:houseId/clients/:clientId", () => {
    let admin: TestEmployee;
    let director: TestEmployee;
    let associate: TestEmployee;

    const house = {
        id: "H1001",
        name: "Harmony Home",
        street1: "1 Peaceful Way",
        city: "Calmville",
        state: "WA",
        maxClients: 2,
        femaleEmployeeOnly: false,
    };
    const client = {
        id: "T12345",
        legalName: "Test Client",
        dateOfBirth: "2000-04-12",
        sex: "M",
        houseId: ""
    };
    beforeAll(async () => {
        const employees = await setupHouseTest();
        admin = employees.admin;
        director = employees.director;
        associate = employees.associate;

        const response = await request(app).post("/api/house")
            .set("Authorization", `Bearer ${director.token}`)
            .send(house);
        house.id = response.body.house.id;
        client.houseId = response.body.house.id;
    });
    beforeEach(async () => {
        await request(app).post("/api/client")
            .set("Authorization", `Bearer ${admin.token}`)
            .send(client);
    });

    afterEach(async () => {
        // Clean DB
        await prisma.client.deleteMany();
    });

    afterAll(async () => {
        await teardownHouseTests();
    });

    it("should remove a client from a house and return updated house", async () => {
        const res = await request(app)
            .delete(`/api/house/${house.id}/clients/${client.id}`)
            .set("Authorization", `Bearer ${director.token}`);

        expect(res.statusCode).toBe(209);
        expect(res.body.message).toBe("client removed from house");
        expect(res.body.house.clients).not.toContainEqual(
            expect.objectContaining({ clientId: client.id })
        );

        // Double check DB
        const clientCheck = await prisma.client.findFirst({ where: { id: client.id } });
        expect(clientCheck?.houseId).toBeNull();
    });

    it("should return 400 if houseId is invalid", async () => {
        const res = await request(app)
            .delete(`/api/house/invalid-house/clients/${client.id}`)
            .set("Authorization", `Bearer ${director.token}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.errors.houseId).toBe("House ID not found");
    });

    it("should return 400 if clientId is invalid", async () => {
        const res = await request(app)
            .delete(`/api/house/${house.id}/clients/invalid-client`)
            .set("Authorization", `Bearer ${director.token}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.errors.clientId).toBe("Client ID not found");
    });

    it("should return 401 if not authenticated", async () => {
        const res = await request(app)
            .delete(`/api/house/${house.id}/clients/${client.id}`);

        expect(res.statusCode).toBe(401);
    });

    it("should return 403 if user lacks permissions", async () => {
        const res = await request(app)
            .delete(`/api/house/${house.id}/clients/${client.id}`)
            .set("Authorization", `Bearer ${associate.token}`);

        expect(res.statusCode).toBe(403);
    });

    it("should handle server errors", async () => {
        jest.spyOn(require("../../services/house.service"), "removeHouseClient")
            .mockRejectedValue(new Error("Database connection failed"));
        const response = await request(app)
            .delete(`/api/house/${house.id}/clients/${client.id}`)
            .set("Authorization", `Bearer ${director.token}`);

        expect(response.status).toBe(500);
    })
});
