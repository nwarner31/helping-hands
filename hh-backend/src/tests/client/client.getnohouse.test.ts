import {beforeAll} from "@jest/globals";
import request from "supertest";
import app from "../../app";
import {clientSetupTests, clientTeardownTests} from "./client.setuptest";
import {TestEmployee} from "../setuptestemployees";


describe("Client Routes - Get no house", () => {
    let admin: TestEmployee;
    let associate: TestEmployee;
    beforeAll(async () => {
        const employees = await clientSetupTests();
        admin = employees.admin;
        associate = employees.associate;

        const client1Promise = request(app).post("/api/client")
            .set("Authorization", `Bearer ${admin.token}`)
            .send({id: "C4001",
                legalName: "Unhoused Client",
                dateOfBirth: new Date("1985-06-06"),
                sex: "M"});
        const client2Promise = request(app).post("/api/house")
            .set("Authorization", `Bearer ${admin.token}`)
            .send( {
                id: "H3001",
                name: "Safe Haven",
                street1: "3 Shelter St",
                city: "Refuge",
                state: "TX",
                maxClients: 3,
                femaleEmployeeOnly: false,
            });
        const client3Promise = request(app).post("/api/client")
            .set("Authorization", `Bearer ${admin.token}`)
            .send({id: "C4002",
                legalName: "Housed Client",
                dateOfBirth: new Date("1991-04-10"),
                sex: "M"});
        await Promise.all([client1Promise, client2Promise, client3Promise]);
        await request(app).patch("/api/house/H3001/clients")
            .set("Authorization", `Bearer ${admin.token}`)
            .send({clientId: "C4002"});
    });
    afterAll(async () => {
       await clientTeardownTests();
    });
    it("should return a list of clients without a house", async () => {
        const res = await request(app)
            .get("/api/client/no-house")
            .set("Authorization", `Bearer ${admin.token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("clients found");
        expect(Array.isArray(res.body.clients)).toBe(true);
        expect(res.body.clients.length).toBe(1);
        expect(res.body.clients[0].id).toBe("C4001");
    });
    it("should return 401 if not authenticated", async () => {
        const res = await request(app).get("/api/house/no-house");
        expect(res.status).toBe(401);
    });
    it("should return 403 if user does not have ADMIN or DIRECTOR role", async () => {
       const res = await request(app)
            .get("/api/client/no-house")
            .set("Authorization", `Bearer ${associate.token}`);

        expect(res.status).toBe(403);
    });
    it("should handle server errors", async () => {
        jest.spyOn(require("../../services/client.service"), "getHomelessClients")
            .mockRejectedValue(new Error("Database connection failed"));
        const response = await request(app).get("/api/client/no-house")
            .set("Authorization", `Bearer ${admin.token}`)
        expect(response.status).toBe(500);
    });
})