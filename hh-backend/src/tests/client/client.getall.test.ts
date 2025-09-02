import {beforeAll} from "@jest/globals";
import request from "supertest";
import app from "../../app";
import {clientSetupTests, clientTeardownTests} from "./client.setuptest";


describe("Client Routes - Get All Clients", () => {
    let token: string | null = null;
    beforeAll(async () => {
        const tokens = await clientSetupTests();
        token = tokens.adminToken;
        const client1Promise = request(app).post("/api/client")
            .set("Authorization", `Bearer ${token}`)
            .send({id: "T12345", legalName: "Test Client", dateOfBirth: "2000-04-12", sex: "F"});
        const client2Promise = request(app).post("/api/client")
            .set("Authorization", `Bearer ${token}`)
            .send({id: "C234567", legalName: "Second Client", dateOfBirth: "2000-04-12", sex: "M"});
        await Promise.all([client1Promise, client2Promise]);
    });
    afterAll(async () => {
        await clientTeardownTests();
    });
    it("should return all clients with a valid token", async () => {
        const response = await request(app).get("/api/client")
            .set("Authorization", `Bearer ${token}`)
        expect(response.body.message).toBe("clients successfully retrieved");
        expect(response.body.clients).toHaveLength(2);
    });
    it("should return 401 with no token", async () => {
        const response = await request(app).get("/api/client")
        expect(response.statusCode).toBe(401);
    });
    it("should handle server errors", async () => {
        jest.spyOn(require("../../services/client.service"), "getClients")
            .mockRejectedValue(new Error("Database connection failed"));
        const response = await request(app).get("/api/client")
            .set("Authorization", `Bearer ${token}`)
        expect(response.status).toBe(500);
    })
});