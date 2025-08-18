import request from "supertest";
import app from "../../../app";
import prisma from "../../../utility/prisma";
import {Event} from "@prisma/client";
//import { seedClient, seedEvents, authHeader } from "../helpers/testUtils";
import {clientSetupTests} from "../client.setuptest";

describe("GET /:clientId/event/upcoming", () => {
    const clientId = "C12345";
    const validEvent = {
        id: "T123456",
        type: "WORK",
        description: "Test Work Event",
        beginDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        beginTime: "10:00",
        endTime: "12:00",
        numberStaffRequired: 2,
    };

    let adminToken: string;
    let associateToken: string;

    beforeAll(async () => {
        const tokens = await clientSetupTests();
        adminToken = tokens.adminToken;
        associateToken = tokens.associateToken;

        await prisma.client.create({
            data: {
                id: clientId,
                legalName: "Client for Event",
                dateOfBirth: new Date("2000-01-01"),
                sex: "F",
            },
        });
        // Create both upcoming and past events for this client
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await request(app)
            .post(`/api/client/${clientId}/event`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({...validEvent, beginDate: tomorrow, endDate: tomorrow});
        await request(app)
            .post(`/api/client/${clientId}/event`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({...validEvent, id: "Y12345", beginDate: yesterday, endDate: yesterday});
    });

    it("returns only upcoming events for the client", async () => {
        const res = await request(app)
            .get(`/api/client/${clientId}/event/upcoming`)
            .set("Authorization", `Bearer ${adminToken}`) // or admin/manager as needed
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
            .get(`/api/client/${clientId}/event/upcoming`);

        expect(response.status).toBe(401);
    });

    it("returns 404 if client does not exist", async () => {
        const res = await request(app)
            .get(`/api/client/nonexistent-client-id/event/upcoming`)
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(404);

        expect(res.body.errors).toBeDefined();
    });
});
