import request from "supertest";
import app from "../../app"; // adjust import based on your project
import {beforeAll} from "@jest/globals";
import {clientSetupTests, clientTeardownTests} from "./client.setuptest";
import {TestEmployee} from "../setuptestemployees";

describe("GET /clients/:clientId", () => {
    let admin: TestEmployee;
    let associate: TestEmployee;
    const client = {id: "T12345", legalName: "Test Client", dateOfBirth: "2000-04-12", sex: "F"};
    beforeAll(async () => {
        const employees = await clientSetupTests();
        admin = employees.admin;
        associate = employees.associate;
        const clientResponse = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${admin.token}`)
            .send(client);
    });
    afterAll(async () => {
        await clientTeardownTests();
    })
    it("should return 200 and client data when client exists", async () => {
        const res = await request(app)
            .get(`/api/client/${client.id}`)
            .set("Authorization", `Bearer ${associate.token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toEqual("Client found");
        expect(res.body.client).toBeDefined();
        expect(res.body.client.id).toEqual("T12345");
    });

    it("should include conflict data for an admin", async () => {
        const res = await request(app)
            .get(`/api/client/${client.id}`)
            .set("Authorization", `Bearer ${admin.token}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toEqual("Client found");
        expect(res.body.client).toBeDefined();
        expect(res.body.client.id).toEqual("T12345");
        expect(res.body.client.hasConflicts).toBeDefined();
    });

    it("should not return conflict data for an associate", async () => {
        const res = await request(app)
            .get(`/api/client/${client.id}`)
            .set("Authorization", `Bearer ${associate.token}`);
        expect(res.status).toBe(200);
        expect(res.body.client.hasConflicts).toBeUndefined();
    })

    it("should return 400 for an empty client id", async () => {
        const res = await request(app)
        .get("/api/client/%20")
        .set("Authorization", `Bearer ${associate.token}`);
        expect(res.status).toBe(400);
        expect(res.body.message).toEqual("Invalid data");
        expect(res.body.errors).toEqual("Client Id is required");
    })

    it("should return 404 if client not found", async () => {
        const res = await request(app)
            .get("/api/client/nonexistent")
            .set("Authorization", `Bearer ${associate.token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("client not found");
    });

    it("should return 401 if no token is provided", async () => {
        const res = await request(app).get(`/api/client/${client.id}`);

        expect(res.status).toBe(401);
    });

    it("should return 500 if service throws an error", async () => {
        jest.spyOn(require("../../services/client/client.service"), "getClientByClientId")
            .mockRejectedValue(new Error("Database connection failed"));
        const res = await request(app)
            .get(`/api/client/${client.id}`)
            .set("Authorization", `Bearer ${associate.token}`);

        expect(res.status).toBe(500);
        expect(res.body.message).toBe("Database connection failed");
    });
});
