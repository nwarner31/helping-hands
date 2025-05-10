import {beforeAll} from "@jest/globals";
import request from "supertest";
import app from "../../app";
import {clientSetupTests, clientTeardownTests} from "./client.setuptest";


describe("Client Routes - Update Client", () => {
    let adminToken: string;
    let associateToken: string
    const client = {clientId: "T12345", legalName: "Test Client", dateOfBirth: "2000-04-12"};
    beforeAll(async () => {
        const tokens = await clientSetupTests();
       adminToken = tokens.adminToken;
       associateToken = tokens.associateToken
       const clientResponse = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(client);
    });
    afterAll(async () => {
        await clientTeardownTests();
    })
    it("should update the client with the correct data and token", async () => {
        const updatedClient = {...client, legalName: "Updated Client"};
        const response = await request(app)
            .put(`/api/client/${client.clientId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send(updatedClient);
        expect(response.status).toBe(200);
        expect(response.body.client.legalName).toBe("Updated Client");
    });
    it("should return 401 for no token", async () => {
        const updatedClient = {...client, legalName: "Updated Client"};
        const response = await request(app)
            .put(`/api/client/${client.clientId}`)
            .send(updatedClient);
        expect(response.status).toBe(401);
    });
    it("should come back with a 403 if not an admin", async () => {
        const updatedClient = {...client, legalName: "Updated Client"};
        const response = await request(app)
            .put(`/api/client/${client.clientId}`)
            .set("Authorization", `Bearer ${associateToken}`)
            .send(updatedClient);
        expect(response.status).toBe(403);
    });
    const requiredFields = ["clientId", "legalName", "dateOfBirth"];

    requiredFields.forEach((field) => {
        it(`should return 400 when '${field}' is missing`, async () => {
            const invalidData = {...client};
            delete invalidData[field as keyof typeof client];  // Remove the field
            const response = await request(app).put(`/api/client/${client.clientId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
            expect(response.body.message).toHaveProperty(field);
        });
    });
});