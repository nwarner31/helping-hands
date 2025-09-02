import request from "supertest";
import app from "../../app"; // adjust import based on your project
import {beforeAll} from "@jest/globals";
import {clientSetupTests, clientTeardownTests} from "./client.setuptest";

describe("GET /clients/:clientId", () => {
    let adminToken: string;
    let associateToken: string
    const client = {id: "T12345", legalName: "Test Client", dateOfBirth: "2000-04-12", sex: "F"};
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
    it("should return 200 and client data when client exists", async () => {
        const res = await request(app)
            .get(`/api/client/${client.id}`)
            .set("Authorization", `Bearer ${associateToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toEqual("client found");
        expect(res.body.client).toBeDefined();
        expect(res.body.client.id).toEqual("T12345");
    });

    it("should return 404 if client not found", async () => {
        const res = await request(app)
            .get("/api/client/nonexistent")
            .set("Authorization", `Bearer ${associateToken}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("client not found");
    });

    it("should return 401 if no token is provided", async () => {
        const res = await request(app).get(`/api/client/${client.id}`);

        expect(res.status).toBe(401);
    });

    it("should return 500 if service throws an error", async () => {
        jest.spyOn(require("../../services/client.service"), "getClientByClientId")
            .mockRejectedValue(new Error("Database connection failed"));
        const res = await request(app)
            .get(`/api/client/${client.id}`)
            .set("Authorization", `Bearer ${associateToken}`);

        expect(res.status).toBe(500);
        expect(res.body.message).toBe("Database connection failed");
    });
});
