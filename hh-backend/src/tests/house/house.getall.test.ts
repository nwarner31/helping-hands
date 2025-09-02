import prisma from "../../utility/prisma";
import request from "supertest";
import app from "../../app";
import {setupHouseTest, teardownHouseTests} from "./house.setuptest";


describe("HOUSE - get all houses", () => {
    const endpoint = "/api/house";
    let token: string;
    beforeAll(async () => {
        const tokens = await setupHouseTest();
        token = tokens.associateToken;
        // Create a house
        await prisma.house.create({
            data: {
                id: "H1234",
                name: "Alpha House",
                street1: "100 Main St",
                city: "Townsville",
                state: "TS",
                maxClients: 3,
                femaleEmployeeOnly: false,
            },
        });
    });
    afterAll(async () => {
        await teardownHouseTests();
    });

    it("should return all houses for an authenticated user", async () => {
        const res = await request(app)
            .get(endpoint)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("message", "houses successfully retrieved");
        expect(Array.isArray(res.body.houses)).toBe(true);
        expect(res.body.houses.length).toBeGreaterThan(0);
        expect(res.body.houses[0]).toHaveProperty("id", "H1234");
    });

    it("should return 401 if no token is provided", async () => {
        const res = await request(app).get(endpoint);
        expect(res.status).toBe(401);
    });

    it("should handle internal server errors", async () => {
        jest.spyOn(require("../../services/house.service"), "getHouses")
            .mockRejectedValue(new Error("Database connection failed"));

        const res = await request(app)
            .get(endpoint)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(500);
    });
});