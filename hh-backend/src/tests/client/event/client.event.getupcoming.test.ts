import request from "supertest";
import app from "../../../app";
import prisma from "../../../utility/prisma";
import {Client, Event, EventType} from "@prisma/client";
import {clientSetupTests, clientTeardownTests} from "../client.setuptest";
import {TestEmployee} from "../../setuptestemployees";
import {setupTestClients, teardownTestClients} from "../../setuptestclients";

describe("GET /:clientId/event/upcoming", () => {
    let testClient: Client;
    const validEvent = {
        id: "T123456",
        type: EventType.WORK,
        description: "Test Work Event",
        beginDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        beginTime: "2025-01-01T10:00:00.000Z",
        endTime: "2025-01-01T12:00:00.000Z",
        numberStaffRequired: 2,
    };

    let admin: TestEmployee;
    let associate: TestEmployee;

    beforeAll(async () => {
        await prisma.event.deleteMany();
        const employees = await clientSetupTests();
        admin = employees.admin;
        associate = employees.associate;
        const clients = await setupTestClients();
        testClient = clients.client1;
        // Create both upcoming and past events for this client
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await prisma.event.createMany({
            data: [
                {...validEvent, beginDate: tomorrow, endDate: tomorrow, clientId: testClient.id},
                {...validEvent, id: "Y12345", beginDate: yesterday, endDate: yesterday, clientId: testClient.id}]
        });
    });
    afterAll(async () => {
        await prisma.event.deleteMany();
        await teardownTestClients();
        await clientTeardownTests();
    });

    it("returns only upcoming events for the client", async () => {
        const res = await request(app)
            .get(`/api/client/${testClient.id}/event/upcoming`)
            .set("Authorization", `Bearer ${admin.token}`) // or admin/manager as needed
            .expect(200);

        expect(res.body.message).toBe("Events found");
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBe(1);
        // Ensure only future events are returned
        const allInFuture = res.body.events.every((e: Event) => new Date(e.beginDate) > new Date());
        expect(allInFuture).toBe(true);
    });

    it("should return 401 if no token provided", async () => {
        const response = await request(app)
            .get(`/api/client/${testClient.id}/event/upcoming`);

        expect(response.status).toBe(401);
    });

    it("returns 404 if client does not exist", async () => {
        const res = await request(app)
            .get(`/api/client/nonexistent-client-id/event/upcoming`)
            .set("Authorization", `Bearer ${admin.token}`)
            .expect(404);

        expect(res.body.errors).toBeDefined();
    });

    it("should handle server errors", async () => {
        jest.spyOn(require("../../../services/client.service"), "getClientByClientId")
            .mockRejectedValue(new Error("Database connection failed"));
        const res = await request(app)
            .get(`/api/client/${testClient.id}/event/upcoming`)
            .set("Authorization", `Bearer ${admin.token}`) // or admin/manager as needed
            .expect(500);
    });
});
