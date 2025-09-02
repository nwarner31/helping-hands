import prisma from "../../utility/prisma";
import request from "supertest";
import app from "../../app";
import {setupHouseTest, teardownHouseTests} from "./house.setuptest";

describe("HOUSE - update house", () => {
    const updatedHouse = {
        id: "H1234",
        name: "Updated Name",
        street1: "456 New Street",
        city: "Tacoma",
        state: "WA",
        maxClients: 3,
        femaleEmployeeOnly: true,
    };
    let directorToken: string;
    let associateToken: string;
    beforeEach(async () => {
        const tokens = await setupHouseTest();
        directorToken = tokens.directorToken;
        associateToken = tokens.associateToken;
        await prisma.house.create({
            data: {
                id: "H1234",
                name: "Original Name",
                street1: "123 Test Loop",
                city: "Seattle",
                state: "WA",
                maxClients: 2,
                femaleEmployeeOnly: false,
            }
        });
    });
    afterAll(async () => {
        await teardownHouseTests();
    })

    it("should successfully update the house for a director", async () => {
        const response = await request(app)
            .put("/api/house/H1234")
            .set("Authorization", `Bearer ${directorToken}`)
            .send(updatedHouse);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("House successfully updated");
        expect(response.body.house.name).toBe("Updated Name");
        expect(response.body.house.city).toBe("Tacoma");
    });

    it("should return 401 if no token provided", async () => {
        const response = await request(app).put("/api/house/H1234").send(updatedHouse);
        expect(response.status).toBe(401);
    });

    it("should return 403 for associate-level user", async () => {
        const response = await request(app)
            .put("/api/house/H1234")
            .set("Authorization", `Bearer ${associateToken}`)
            .send(updatedHouse);

        expect(response.status).toBe(403);
    });

    const requiredFields = [
        "id",
        "name",
        "street1",
        "city",
        "state",
        "maxClients",
        "femaleEmployeeOnly",
    ];

    requiredFields.forEach((field) => {
        it(`should return 400 when '${field}' is missing`, async () => {
            const validHouse = {
                id: "H1234",
                name: "Updated Name",
                street1: "456 New Street",
                city: "Tacoma",
                state: "WA",
                maxClients: 3,
                femaleEmployeeOnly: true,
            };

            const invalidData = { ...validHouse };
            delete invalidData[field as keyof typeof validHouse];

            const response = await request(app)
                .put(`/api/house/${validHouse.id}`)
                .set("Authorization", `Bearer ${directorToken}`)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message", "invalid data");
            expect(response.body.errors).toHaveProperty(field);
        });
    });


    it("should return 400 if house does not exist", async () => {
        const response = await request(app)
            .put("/api/house/NON_EXISTENT")
            .set("Authorization", `Bearer ${directorToken}`)
            .send({ ...updatedHouse, houseId: "NON_EXISTENT" });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("invalid data");
        expect(response.body.errors).toHaveProperty("houseId");
    });

    it("should handle server errors", async () => {
        jest.spyOn(require("../../services/house.service"), "updateHouse")
            .mockRejectedValue(new Error("Database connection failed"));
        const response = await request(app)
            .put("/api/house/H1234")
            .set("Authorization", `Bearer ${directorToken}`)
            .send(updatedHouse);
        expect(response.status).toBe(500);
    })
});