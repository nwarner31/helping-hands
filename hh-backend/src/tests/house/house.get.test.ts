import prisma from "../../utility/prisma";
import request from "supertest";
import app from "../../app";
import { setupHouseTest, teardownHouseTests } from "./house.setuptest";
import {TestEmployee} from "../setuptestemployees";

describe("HOUSE - get house by ID", () => {
    let director: TestEmployee;
    let associate: TestEmployee;
    let houseId: string;

    beforeAll(async () => {
        const employees = await setupHouseTest();
        director = employees.director;
        associate = employees.associate;
    });

    beforeEach(async () => {
        await prisma.house.deleteMany();

        // Add a house to fetch
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

    it("should return 200 and the house for a valid ID", async () => {
        const res = await request(app)
            .get(`/api/house/${houseId}`)
            .set("Authorization", `Bearer ${director.token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("house");
        expect(res.body.house.id).toBe(houseId);
        expect(res.body.message).toBe("House found");
    });

    it("should return 404 for a non-existent house", async () => {
        const res = await request(app)
            .get("/api/house/INVALID_ID")
            .set("Authorization", `Bearer ${director.token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("House not found");
    });

    it("should return 401 if no token provided", async () => {
        const res = await request(app)
            .get(`/api/house/${houseId}`);

        expect(res.status).toBe(401);
    });


    it("should handle server errors", async () => {
        jest.spyOn(require("../../services/house.service"), "getHouseByHouseId")
            .mockRejectedValue(new Error("Database failure"));

        const res = await request(app)
            .get(`/api/house/${houseId}`)
            .set("Authorization", `Bearer ${director.token}`);

        expect(res.status).toBe(500);
    });
});
