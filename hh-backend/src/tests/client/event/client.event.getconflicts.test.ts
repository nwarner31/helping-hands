import {TestEmployee} from "../../setuptestemployees";
import {Client, EventType} from "@prisma/client";
import {addDays, addMonths} from "date-fns";
import {clientSetupTests} from "../client.setuptest";
import {setupTestClients, teardownTestClients} from "../../setuptestclients";
import prisma from "../../../utility/prisma";
import request from "supertest";
import app from "../../../app";


describe("GET /client/:clientId/event/getConflicts - Get Conflicts", () => {
    let admin: TestEmployee;
    let associate: TestEmployee;
    let client1: Client;
    let client2: Client;
    const monthFromToday = addMonths(new Date(), 1);
    beforeAll(async () => {
        const employees = await clientSetupTests();
        admin = employees.admin;
        associate = employees.associate;
        const clients = await setupTestClients();
        client1 = clients.client1;
        client2 = clients.client2;
        const today = new Date();

        const sharedEventData = {
            type: EventType.SOCIAL,
            description: "Test Event",
            beginDate: today,
            endDate: today,
            numberStaffRequired: 1
        }
        await prisma.event.createMany({
            data: [
                {...sharedEventData, id: "T001", beginTime: "2025-01-01T08:00:00.000Z", endTime: "2025-01-01T10:00:00.000Z", clientId: client1.id},
                {...sharedEventData, id: "T002", beginTime: "2025-01-01T09:00:00.000Z", endTime: "2025-01-01T11:00:00.000Z", clientId: client1.id},
                {...sharedEventData, id: "T003", beginTime: "2025-01-01T08:00:00.000Z", endTime: "2025-01-01T10:00:00.000Z", clientId: client2.id},
                {...sharedEventData, id: "T004", beginTime: "2025-01-01T11:00:00.000Z", endTime: "2025-01-01T12:00:00.000Z", clientId: client2.id},
                {...sharedEventData, id: "T005", beginTime: "2025-01-01T08:00:00.000Z", endTime: "2025-01-01T10:00:00.000Z", clientId: client1.id,
                    beginDate: monthFromToday, endDate: monthFromToday},
                {...sharedEventData, id: "T006", beginTime: "2025-01-01T09:00:00.000Z", endTime: "2025-01-01T11:00:00.000Z", clientId: client1.id,
                    beginDate: monthFromToday, endDate: monthFromToday},
            ]
        })
    });

    afterAll(async () => {
        await prisma.event.deleteMany();
        await teardownTestClients();
        await teardownTestClients();
    });

    it("should get the conflict data for a client when there are conflicts", async () => {
        const res = await request(app).get(`/api/client/${client1.id}/event/get-conflicts`)
            .set("Authorization", `Bearer ${admin.token}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Event conflict data found");
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].event.id).toBe("T001");
        expect(res.body.data[0].conflicts).toHaveLength(1);
        expect(res.body.data[0].conflicts[0].id).toBe("T002");
    });

    it("should get the conflicts for if only the begin date is provided", async () => {
        const tomorrow = addDays(new Date(), 1);
        const res = await request(app).get(`/api/client/${client1.id}/event/get-conflicts?beginDate=${tomorrow.toISOString().split('T')[0]}`)
            .set("Authorization", `Bearer ${admin.token}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Event conflict data found");
        expect(res.body.data).toHaveLength(0);
    });

    it("should get the conflicts for if only the end date is provided", async () => {
        const res = await request(app).get(`/api/client/${client1.id}/event/get-conflicts?endDate=${monthFromToday.toISOString().split('T')[0]}`)
            .set("Authorization", `Bearer ${admin.token}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Event conflict data found");
        expect(res.body.data).toHaveLength(2);
        expect(res.body.data[0].event.id).toBe("T001");
        expect(res.body.data[0].conflicts).toHaveLength(1);
        expect(res.body.data[0].conflicts[0].id).toBe("T002");
        expect(res.body.data[1].event.id).toBe("T005");
        expect(res.body.data[1].conflicts).toHaveLength(1);
        expect(res.body.data[1].conflicts[0].id).toBe("T006");
    });

    it("should get the conflicts if both the begin and end date is provided", async () => {
        const tomorrow = addDays(new Date(), 1);
        const threeDaysLater = addDays(tomorrow, 3);
        const res = await request(app).get(`/api/client/${client1.id}/event/get-conflicts?beginDate=${tomorrow.toISOString().split('T')[0]}&endDate=${threeDaysLater.toISOString().split('T')[0]}`)
            .set("Authorization", `Bearer ${admin.token}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Event conflict data found");
        expect(res.body.data).toHaveLength(0);
    });

    it("should return that there are no conflicts when there are none", async () => {
        const res = await request(app).get(`/api/client/${client2.id}/event/get-conflicts`)
            .set("Authorization", `Bearer ${admin.token}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Event conflict data found");
        expect(res.body.data).toHaveLength(0);
    });

    it("should return 404 for a client id that does not exist", async () => {
        const res = await request(app).get('/api/client/iamnotaclientid/event/get-conflicts')
            .set("Authorization", `Bearer ${admin.token}`);
        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Client error");
        expect(res.body.errors).toBe("Client not found");
    });

    it("should return 401 for no auth header", async () => {
        const res = await request(app).get(`/api/client/${client1.id}/event/get-conflicts`);
        expect(res.status).toBe(401);
    });

    it("should return 403 for associate user", async () => {
        const res = await request(app).get(`/api/client/${client1.id}/event/get-conflicts`)
            .set("Authorization", `Bearer ${associate.token}`);
        expect(res.status).toBe(403);
    });

    it("should return 400 for an invalid begin date", async () => {
        const res = await request(app).get(`/api/client/${client1.id}/event/get-conflicts?beginDate=aaa`)
            .set("Authorization", `Bearer ${admin.token}`);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid data");
        expect(res.body.errors).toBe("Invalid beginDate");
    });

    it("should return 400 for an invalid end date", async () => {
        const res = await request(app).get(`/api/client/${client1.id}/event/get-conflicts?endDate=aaa`)
            .set("Authorization", `Bearer ${admin.token}`);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid data");
        expect(res.body.errors).toBe("Invalid endDate");
    });

    it("should return 400 for an end date before the begin date", async () => {
        const today = new Date();
        const tomorrow = addDays(today, 1);
        const res = await request(app).get(`/api/client/${client1.id}/event/get-conflicts?beginDate=${tomorrow.toISOString().split('T')[0]}&endDate=${today.toISOString().split('T')[0]}`)
            .set("Authorization", `Bearer ${admin.token}`);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid data");
        expect(res.body.errors).toBe("End date must be after begin date");
    });

    it("should handle server errors", async () => {
        jest.spyOn(require("../../../services/client/clientEvent.service"), "getClientEventConflicts")
            .mockRejectedValue(new Error("Database connection failed"));
        const res = await request(app).get(`/api/client/${client2.id}/event/get-conflicts`)
            .set("Authorization", `Bearer ${admin.token}`);
        expect(res.status).toBe(500);
    })
});