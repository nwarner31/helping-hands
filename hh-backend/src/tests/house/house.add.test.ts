import prisma from "../../utility/prisma";
import request from "supertest";
import app from "../../app";
import {setupHouseTest, teardownHouseTests} from "./house.setuptest";


describe("HOUSE - add house", () => {
    let directorToken: string;
    let associateToken: string;
    beforeAll(async () => {
        const tokens = await setupHouseTest();
        directorToken = tokens.directorToken;
        associateToken = tokens.associateToken;
    });
    beforeEach(async () => {
        await prisma.house.deleteMany();
    });
    afterAll(async () => {
        await teardownHouseTests();
    });
    const validHouse = { id: "H1234", name: "Testtopia", street1: "123 Test Loop", city: "Seattle", state: "WA", maxClients: 2, femaleEmployeeOnly: false};
    it("should successfully add the house for a director", async () => {
        const response = await request(app).post("/api/house")
            .set("Authorization", `Bearer ${directorToken}`)
            .send(validHouse);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("house");
        expect(response.body.message).toBe("House successfully added");
    });
    it("should return a 401 if no token provided", async () => {
        const response = await request(app).post("/api/house")
            .send(validHouse);
        expect(response.statusCode).toBe(401);
    });
    it("should return 403 for ASSOCIATE (or MANAGER)", async () => {
        const response = await request(app).post("/api/house")
            .set("Authorization", `Bearer ${associateToken}`)
            .send(validHouse);
        expect(response.statusCode).toBe(403);
    });

    const requiredFields = ["id", "name", "street1", "city", "state", "maxClients", "femaleEmployeeOnly"];

    requiredFields.forEach((field) => {
        it(`should return 400 when '${field}' is missing`, async () => {
            const invalidData = {...validHouse};
            delete invalidData[field as keyof typeof validHouse];  // Remove the field
            const response = await request(app).post("/api/house")
                .set("Authorization", `Bearer ${directorToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
            expect(response.body.message).toBe("invalid data");
            expect(response.body.errors).toHaveProperty(field);
        });
    });
    it("should return 400 for max clients below 1", async () => {
        const noClientHouse = {...validHouse, maxClients: -1};
        const response = await request(app).post("/api/house")
            .set("Authorization", `Bearer ${directorToken}`)
            .send(noClientHouse);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("invalid data");
        expect(response.body.errors).toHaveProperty("maxClients");
    })
    it("should return 400 for duplicate house id", async () => {
        const response = await request(app).post("/api/house")
            .set("Authorization", `Bearer ${directorToken}`)
            .send(validHouse);
        const secondHouse = { ...validHouse, name: "New name"};
        const badResponse = await request(app).post("/api/house")
            .set("Authorization", `Bearer ${directorToken}`)
            .send(secondHouse);
        expect(badResponse.statusCode).toBe(400);
        expect(badResponse.body.message).toBe("invalid data");
        expect(badResponse.body.errors).toHaveProperty("houseId");
    });
    it("should return 400 for duplicate house name", async () => {
        const response = await request(app).post("/api/house")
            .set("Authorization", `Bearer ${directorToken}`)
            .send(validHouse);
        const secondHouse = { ...validHouse, houseId: "N1234"};
        const badResponse = await request(app).post("/api/house")
            .set("Authorization", `Bearer ${directorToken}`)
            .send(secondHouse);
        expect(badResponse.statusCode).toBe(400);
        expect(badResponse.body.message).toBe("invalid data");
        expect(badResponse.body.errors).toHaveProperty("name");
    });

    it("should handle server errors", async () => {
        jest.spyOn(require("../../services/house.service"), "addHouse")
            .mockRejectedValue(new Error("Database connection failed"));
        const response = await request(app).post("/api/house")
            .set("Authorization", `Bearer ${directorToken}`)
            .send(validHouse);
        expect(response.status).toBe(500);
    })

});