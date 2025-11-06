import prisma from "../../utility/prisma";
import request from "supertest";
import app from "../../app";
import {clientSetupTests, clientTeardownTests} from "./client.setuptest";
import {TestEmployee} from "../setuptestemployees";


describe("Client Routes - Add Client",  () => {
    const validClient = {id: "T12345", legalName: "Test Client", dateOfBirth: "2000-04-12", sex: "M"};
    let admin: TestEmployee;
    let associate: TestEmployee;
    beforeAll(async () => {
        const employees = await clientSetupTests();
        admin = employees.admin;
        associate = employees.associate;
    });
    beforeEach(async () => {
        await prisma.client.deleteMany();
    });
    afterAll(async () => {
        await prisma.client.deleteMany();
        await clientTeardownTests();
    });
    it("should successfully add a client with correct data and admin", async () => {
        const response = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${admin.token}`)
            .send(validClient);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("client");
        expect(response.body.message).toBe("Client added");
    });
    it("should come back with a 401 if no token provided", async () => {
        const response = await request(app).post("/api/client")
            .send({id: "T12345", legalName: "Test Client", dateOfBirth: "2000-04-12"});
        expect(response.status).toBe(401);
    });
    it("should come back with a 403 if not an admin", async () => {
        const response = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${associate.token}`)
            .send(validClient);
        expect(response.status).toBe(403);
    });

    const requiredFields = ["id", "legalName", "dateOfBirth", "sex"];

    requiredFields.forEach((field) => {
        it(`should return 400 when '${field}' is missing`, async () => {
            const invalidData = { ...validClient };
            delete invalidData[field as keyof typeof validClient];  // Remove the field

           const response = await request(app).post("/api/client")
                .set("Authorization", `Bearer ${admin.token}`)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
            expect(response.body.errors).toHaveProperty(field);
        });
    });
    it("should return 400 for bad date of birth", async () => {
        const invalidDateClient = { ... validClient, dateOfBirth: "bad-dateOfBirth"}
        const response = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${admin.token}`)
            .send(invalidDateClient);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        console.log(response.body.errors);
        expect(response.body.errors).toHaveProperty("dateOfBirth");
    });
    it("should return an error for duplicate client id", async () => {
       const response = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${admin.token}`)
            .send(validClient);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("client");
        expect(response.body.message).toBe("Client added");
        const badResponse = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${admin.token}`)
            .send(validClient);
        expect(badResponse.statusCode).toBe(400);
        expect(badResponse.body.message).toBe("invalid data");
        expect(badResponse.body.errors).toHaveProperty("clientId");
    });
    it("should handle server errors", async () => {
        jest.spyOn(require("../../services/client.service"), "addClient")
            .mockRejectedValue(new Error("Database connection failed"));
        const response = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${admin.token}`)
            .send(validClient);
        expect(response.status).toBe(500);
    })
});