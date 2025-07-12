import prisma from "../../utility/prisma";
import request from "supertest";
import app from "../../app";
import {clientSetupTests, clientTeardownTests} from "./client.setuptest";


describe("Client Routes - Add Client",  () => {
    const validClient = {id: "T12345", legalName: "Test Client", dateOfBirth: "2000-04-12", sex: "M"};
    let adminToken: string;
    let associateToken: string;
    beforeAll(async () => {
        const tokens = await clientSetupTests();
        adminToken = tokens.adminToken;
        associateToken = tokens.associateToken;
    });
    afterEach(async () => {
        await prisma.client.deleteMany();
    });
    afterAll(async () => {
        await clientTeardownTests();
    });
    it("should successfully add a client with correct data and admin", async () => {
        const response = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${adminToken}`)
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
            .set("Authorization", `Bearer ${associateToken}`)
            .send(validClient);
        expect(response.status).toBe(403);
    });

    const requiredFields = ["id", "legalName", "dateOfBirth"];

    requiredFields.forEach((field) => {
        it(`should return 400 when '${field}' is missing`, async () => {
            const invalidData = { ...validClient };
            delete invalidData[field as keyof typeof validClient];  // Remove the field

           const response = await request(app).post("/api/client")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
            expect(response.body.message).toHaveProperty(field);
        });
    });
    it("should return 400 for bad date of birth", async () => {
        const invalidDateClient = { ... validClient, dateOfBirth: "bad-dateOfBirth"}
        const response = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(invalidDateClient);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toHaveProperty("dateOfBirth");
    });
    it("should return an error for duplicate client id", async () => {
       const response = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(validClient);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("client");
        expect(response.body.message).toBe("Client added");
        const badResponse = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(validClient);
        expect(badResponse.statusCode).toBe(400);
        expect(badResponse.body.message).toBe("invalid data");
        expect(badResponse.body.errors).toHaveProperty("clientId");
    })
});