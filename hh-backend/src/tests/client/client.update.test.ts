import {beforeAll} from "@jest/globals";
import request from "supertest";
import app from "../../app";
import {clientSetupTests, clientTeardownTests} from "./client.setuptest";
import {TestEmployee} from "../setuptestemployees";


describe("Client Routes - Update Client", () => {
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
    it("should update the client with the correct data and token", async () => {
        const updatedClient = {...client, legalName: "Updated Client"};
        const response = await request(app)
            .put(`/api/client/${client.id}`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send(updatedClient);
        expect(response.status).toBe(200);
        expect(response.body.client.legalName).toBe("Updated Client");
    });
    it("should return 401 for no token", async () => {
        const updatedClient = {...client, legalName: "Updated Client"};
        const response = await request(app)
            .put(`/api/client/${client.id}`)
            .send(updatedClient);
        expect(response.status).toBe(401);
    });
    it("should come back with a 403 if not an admin", async () => {
        const updatedClient = {...client, legalName: "Updated Client"};
        const response = await request(app)
            .put(`/api/client/${client.id}`)
            .set("Authorization", `Bearer ${associate.token}`)
            .send(updatedClient);
        expect(response.status).toBe(403);
    });
    const requiredFields = ["id", "legalName", "dateOfBirth", "sex"];

    requiredFields.forEach((field) => {
        it(`should return 400 when '${field}' is missing`, async () => {
            const invalidData = {...client};
            delete invalidData[field as keyof typeof client];  // Remove the field
            const response = await request(app).put(`/api/client/${client.id}`)
                .set("Authorization", `Bearer ${admin.token}`)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
            expect(response.body.errors).toHaveProperty(field);
        });
    });
    it("should return 400 for bad date of birth", async () => {
        const invalidDateClient = {...client, dateOfBirth: "bad-dateOfBirth"};
        const response = await request(app).put(`/api/client/${client.id}`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send(invalidDateClient);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.errors).toHaveProperty("dateOfBirth");
    })

    it("should handle server errors", async () => {
        jest.spyOn(require("../../services/client/client.service"), "updateClient")
            .mockRejectedValue(new Error("Database connection failed"));
        const updatedClient = {...client, legalName: "Updated Client"};
        const response = await request(app).put(`/api/client/${client.id}`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send(updatedClient);
        expect(response.status).toBe(500);
    });
});