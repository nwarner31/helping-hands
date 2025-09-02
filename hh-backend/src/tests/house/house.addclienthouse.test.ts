import request from "supertest";
import app from "../../app";
import prisma from "../../utility/prisma";
import {setupHouseTest, teardownHouseTests} from "./house.setuptest";


describe('HOUSE - add client to house', () => {
    let adminToken: string;
    let directorToken: string;
    let associateToken: string;
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
        sex: "M"
    };
    beforeAll(async () => {
        const tokens = await setupHouseTest();
        adminToken = tokens.adminToken;
        directorToken = tokens.directorToken;
        associateToken = tokens.associateToken;
        await request(app).post("/api/house")
            .set("Authorization", `Bearer ${directorToken}`)
            .send(house);
    });

    beforeEach(async () => {
        await request(app).post("/api/client")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(client);

    });
    afterEach(async () => {
        await prisma.client.deleteMany();
    });
    afterAll(async () => {
        await teardownHouseTests();
    });

    it("should successfully add a client to a house", async () => {
        const res = await request(app)
            .patch(`/api/house/${house.id}/clients`)
            .set("Authorization", `Bearer ${directorToken}`)
            .send({ clientId: client.id });

        expect(res.status).toBe(209);
        expect(res.body.message).toBe("client added to house");
        expect(res.body.house).toHaveProperty("id", house.id);
    });
    it("should return 400 if house ID is invalid", async () => {
        const res = await request(app)
            .patch("/api/house/INVALID_ID/clients")
            .set("Authorization", `Bearer ${directorToken}`)
            .send({ clientId: client.id });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("invalid data");
        expect(res.body.errors).toHaveProperty("houseId");
    });
    it("should return 400 if client ID is invalid", async () => {
        const res = await request(app)
            .patch(`/api/house/${house.id}/clients`)
            .set("Authorization", `Bearer ${directorToken}`)
            .send({ clientId: "NON_EXISTENT_CLIENT" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("invalid data");
        expect(res.body.errors).toHaveProperty("clientId");
    });
    it("should return 401 if not authenticated", async () => {
        const res = await request(app)
            .patch("/api/house/H1001/clients")
            .send({ clientId: "C2001" });

        expect(res.status).toBe(401);
    });
    it("should return 403 for an ASSOCIATE", async () => {
        const res = await request(app)
            .patch(`/api/house/${house.id}/clients`)
            .set("Authorization", `Bearer ${associateToken}`)
            .send({ clientId: client.id });

        expect(res.status).toBe(403);
    });

    it("should handle internal server errors", async () => {
        jest.spyOn(require("../../services/house.service"), "addHouseClient")
            .mockRejectedValue(new Error("Database connection failed"));

        const res = await request(app)
            .patch(`/api/house/${house.id}/clients`)
            .set("Authorization", `Bearer ${directorToken}`)
            .send({ clientId: client.id });

        expect(res.status).toBe(500);
    });
});