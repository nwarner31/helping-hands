import request from "supertest";
import app from "../../../../app";
import prisma from "../../../../utility/prisma";
import {Client, Event} from "@prisma/client";
import {clientSetupTests, clientTeardownTests} from "../client.setuptest";
import {addDays, addHours, addMonths} from "date-fns";
import {TestEmployee} from "../../../setuptestemployees";
import {setupTestClients, teardownTestClients} from "../../../setuptestclients";


describe("GET /client/:clientId/event", () => {
    let testClient: Client;
    let admin: TestEmployee;
    let associate: TestEmployee;
    // Today (the minus hours are to reduce to local time instead of utc)
    const today = addHours(new Date(), -7);

// One month from today
    const oneMonthFromToday = addMonths(new Date().setDate(1), 1);

    beforeAll(async () => {
        const employees = await clientSetupTests();
        admin = employees.admin;
        associate = employees.associate;
        const clients = await setupTestClients();
        testClient = clients.client1;

        await prisma.event.createMany({
            data: [
                {
                    id: "T01",
                    type: "WORK",
                    description: "Test Work Event",
                    beginDate: today,
                    endDate: today,
                    beginTime: (() => { const d = new Date(today); d.setHours(10, 0, 0); return d; })(),
                    endTime: (() => { const d = new Date(today); d.setHours(12, 0, 0); return d; })(),
                    numberStaffRequired: 2,
                    clientId: testClient.id,
                },
                {
                    id: "T02",
                    type: "WORK",
                    description: "Test Work Event",
                    beginDate: oneMonthFromToday,
                    endDate: oneMonthFromToday,
                    beginTime: (() => { const d = new Date(oneMonthFromToday); d.setHours(10, 0, 0); return d; })(),
                    endTime: (() => { const d = new Date(oneMonthFromToday); d.setHours(12, 0, 0); return d; })(),
                    numberStaffRequired: 2,
                    clientId: testClient.id,
                },
            ],
        });
    });

    afterAll(async () => {
        await prisma.event.deleteMany();
        await teardownTestClients();
        await clientTeardownTests();
    });

    it("returns current month's events if no query params are provided", async () => {
        const res = await request(app)
            .get(`/api/client/${testClient.id}/event`)
            .set("Authorization", `Bearer ${associate.token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("returns events for a given month", async () => {
        const month = oneMonthFromToday.getMonth() + 1;
        const monthString = month > 9 ? month.toString() : "0" + month.toString();
        const year = oneMonthFromToday.getFullYear();
        const res = await request(app)
            .get(`/api/client/${testClient.id}/event?month=${year}-${monthString}`)
            .set("Authorization", `Bearer ${associate.token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].id).toBe("T02");
        expect(res.body.data.every((e: any) => e.beginDate.startsWith(`${year}-${monthString}`))).toBe(true);
    });

    it("returns events for a from/to range", async () => {
        const beginDate = addDays(today, - 1);
        const beginDayString = beginDate.getDate() > 9 ? beginDate.getDate().toString() : "0" + beginDate.getDate().toString();
        const beginMonth = beginDate.getMonth() + 1;
        const beginMonthString = beginMonth > 9 ? beginMonth.toString() : "0" + beginMonth.toString();
        const beginYear = beginDate.getFullYear();
        const endDate = addDays(oneMonthFromToday, - 1);
        const endDayString = endDate.getDate() > 9 ? endDate.getDate().toString() : "0" + endDate.getDate().toString();
        const endMonth = endDate.getMonth() + 1;
        const endMonthString = endMonth > 9 ? endMonth.toString() : "0" + endMonth.toString();
        const endYear = oneMonthFromToday.getFullYear();
        const res = await request(app)
            .get(`/api/client/${testClient.id}/event?from=${beginYear}-${beginMonthString}-${beginDayString}&to=${endYear}-${endMonthString}-${endDayString}`)
            .set("Authorization", `Bearer ${associate.token}`);
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].id).toBe("T01");
    });

    it("should return 400 if has a from and no to" , async () => {
        const res = await request(app)
            .get(`/api/client/${testClient.id}/event?from=2025-09-19`)
            .set("Authorization", `Bearer ${associate.token}`);
        expect(res.status).toBe(400);
        expect(res.body.errors.toDate).toBeDefined();
    });

    it("should return 400 if has a to and no from" , async () => {
        const res = await request(app)
            .get(`/api/client/${testClient.id}/event?to=2025-09-19`)
            .set("Authorization", `Bearer ${associate.token}`);
        expect(res.status).toBe(400);
        expect(res.body.errors.fromDate).toBeDefined();
    });

    it("should return 400 for errors in date format of to and from", async () => {
        const res = await request(app)
            .get(`/api/client/${testClient.id}/event?from=01-01-2025&to=02-01-2025`)
            .set("Authorization", `Bearer ${associate.token}`);
        expect(res.status).toBe(400);
        expect(res.body.errors.fromDate).toBeDefined();
        expect(res.body.errors.toDate).toBeDefined();
    })

    it("returns 400 for invalid month format", async () => {
        const res = await request(app)
            .get(`/api/client/${testClient.id}/event?month=08-2025`)
            .set("Authorization", `Bearer ${associate.token}`);

        expect(res.status).toBe(400);
        expect(res.body.errors.month).toBeDefined();
    });
    it("should return 400 for a from date after the to date", async () => {
        const res = await request(app)
            .get(`/api/client/${testClient.id}/event?from=2025-02-01&to=2025-01-01`)
            .set("Authorization", `Bearer ${associate.token}`);
        expect(res.status).toBe(400);
        expect(res.body.errors.fromDate).not.toBeDefined();
        expect(res.body.errors.toDate).toBeDefined();
        expect(res.body.errors.toDate).toMatch(/to date must be after from date/i);
    })

    it("returns 404 for non-existent client", async () => {
        const res = await request(app)
            .get(`/api/client/nonexistentclient/event`)
            .set("Authorization", `Bearer ${associate.token}`);
        expect(res.status).toBe(404);
    });

    it("should return 401 with no auth header", async () => {
        const res = await request(app)
            .get(`/api/client/${testClient.id}/event`);
        expect(res.status).toBe(401);
    });

    it("should handle server errors", async () => {
        jest.spyOn(require("../../../../services/client/client.service"), "getClientEventsInDateRange")
            .mockRejectedValue(new Error("Database connection failed"));
        const res = await request(app)
            .get(`/api/client/${testClient.id}/event`)
            .set("Authorization", `Bearer ${associate.token}`);
        expect(res.status).toBe(500);
    });
});
