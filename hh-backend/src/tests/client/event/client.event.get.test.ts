import request from "supertest";
import app from "../../../app";
import prisma from "../../../utility/prisma";
import {Event} from "@prisma/client";
import {clientSetupTests, clientTeardownTests} from "../client.setuptest";
import { addDays, addMonths } from "date-fns";


describe("GET /client/:clientId/event", () => {
    const clientId = "C12345";
    let adminToken: string;
    let associateToken: string;
// Tomorrow
    const tomorrow = addDays(new Date(), 1);

// One month from today
    const oneMonthFromToday = addMonths(new Date(), 1);

    beforeAll(async () => {
        const tokens = await clientSetupTests();
        adminToken = tokens.adminToken;
        associateToken = tokens.associateToken;
        const client = await prisma.client.create({
            data: { id: clientId,
                legalName: "Client for Event",
                dateOfBirth: new Date("2000-01-01"),
                sex: "F", },
        });

        await prisma.event.createMany({
            data: [
                {
                    id: "T01",
                    type: "WORK",
                    description: "Test Work Event",
                    beginDate: tomorrow,
                    endDate: tomorrow,
                    beginTime: (() => { const d = new Date(tomorrow); d.setHours(10, 0, 0); return d; })(),
                    endTime: (() => { const d = new Date(tomorrow); d.setHours(12, 0, 0); return d; })(),
                    numberStaffRequired: 2,
                    clientId: clientId,
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
                    clientId: clientId,
                },
            ],
        });
    });

    afterAll(async () => {
        await prisma.event.deleteMany();
        await clientTeardownTests();
    });

    it("returns current month's events if no query params are provided", async () => {
        const res = await request(app)
            .get(`/api/client/${clientId}/event`)
            .set("Authorization", `Bearer ${associateToken}`);

        expect(res.status).toBe(200);
        expect(res.body.events.length).toBeGreaterThan(0);
        expect(res.body.numPages).toBeDefined();
    });

    it("returns events for a given month", async () => {
        const month = oneMonthFromToday.getMonth() + 1;
        const monthString = month > 9 ? month.toString() : "0" + month.toString();
        const year = oneMonthFromToday.getFullYear();
        const res = await request(app)
            .get(`/api/client/${clientId}/event?month=${year}-${monthString}`)
            .set("Authorization", `Bearer ${associateToken}`);

        expect(res.status).toBe(200);
        expect(res.body.events.length).toBe(1);
        console.log(res.body.events);
        expect(res.body.events[0].id).toBe("T02");
        expect(res.body.events.every((e: any) => e.beginDate.startsWith(`${year}-${monthString}`))).toBe(true);
    });

    it("returns events for a from/to range", async () => {
        const beginDay = tomorrow.getDate() - 1;
        const beginDayString = beginDay > 9 ? beginDay.toString() : "0" + beginDay.toString();
        const beginMonth = tomorrow.getMonth() + 1;
        const beginMonthString = beginMonth > 9 ? beginMonth.toString() : "0" + beginMonth.toString();
        const beginYear = oneMonthFromToday.getFullYear();
        const endDay = oneMonthFromToday.getDate() - 1;
        const endDayString = endDay > 9 ? endDay.toString() : "0" + endDay.toString();
        const endMonth = oneMonthFromToday.getMonth() + 1;
        const endMonthString = endMonth > 9 ? endMonth.toString() : "0" + endMonth.toString();
        const endYear = oneMonthFromToday.getFullYear();
        const res = await request(app)
            .get(`/api/client/${clientId}/event?from=${beginYear}-${beginMonthString}-${beginDayString}&to=${endYear}-${endMonthString}-${endDayString}`)
            .set("Authorization", `Bearer ${associateToken}`);
        expect(res.status).toBe(200);
        expect(res.body.events.length).toBe(1);
        expect(res.body.events[0].id).toBe("T01");
    });

    it("should return 400 if has a from and no to" , async () => {
        const res = await request(app)
            .get(`/api/client/${clientId}/event?from=2025-09-19`)
            .set("Authorization", `Bearer ${associateToken}`);
        expect(res.status).toBe(400);
        expect(res.body.errors.toDate).toBeDefined();
    });

    it("should return 400 if has a to and no from" , async () => {
        const res = await request(app)
            .get(`/api/client/${clientId}/event?to=2025-09-19`)
            .set("Authorization", `Bearer ${associateToken}`);
        expect(res.status).toBe(400);
        expect(res.body.errors.fromDate).toBeDefined();

    });

    it("should return 400 for errors in date format of to and from", async () => {
        const res = await request(app)
            .get(`/api/client/${clientId}/event?from=01-01-2025&to=02-01-2025`)
            .set("Authorization", `Bearer ${associateToken}`);
        expect(res.status).toBe(400);
        expect(res.body.errors.fromDate).toBeDefined();
        expect(res.body.errors.toDate).toBeDefined();
    })

    it("returns 400 for invalid month format", async () => {
        const res = await request(app)
            .get(`/api/client/${clientId}/event?month=08-2025`)
            .set("Authorization", `Bearer ${associateToken}`);

        expect(res.status).toBe(400);
        expect(res.body.errors.month).toBeDefined();
    });

    it("returns 404 for non-existent client", async () => {
        const res = await request(app)
            .get(`/api/client/nonexistentclient/event`)
            .set("Authorization", `Bearer ${associateToken}`);
        console.log(res.body)
        expect(res.status).toBe(404);
    });

    it("should return 401 with no auth header", async () => {
        const res = await request(app)
            .get(`/api/client/${clientId}/event`);
        expect(res.status).toBe(401);
    });

    it("should return the proper page", async () => {
        const beginDay = tomorrow.getDate() - 1;
        const beginDayString = beginDay > 9 ? beginDay.toString() : "0" + beginDay.toString();
        const beginMonth = tomorrow.getMonth() + 1;
        const beginMonthString = beginMonth > 9 ? beginMonth.toString() : "0" + beginMonth.toString();
        const beginYear = oneMonthFromToday.getFullYear();
        const endDay = oneMonthFromToday.getDate() + 1;
        const endDayString = endDay > 9 ? endDay.toString() : "0" + endDay.toString();
        const endMonth = oneMonthFromToday.getMonth() + 1;
        const endMonthString = endMonth > 9 ? endMonth.toString() : "0" + endMonth.toString();
        const endYear = oneMonthFromToday.getFullYear();
        const resPage1 = await request(app)
            .get(`/api/client/${clientId}/event?from=${beginYear}-${beginMonthString}-${beginDayString}&to=${endYear}-${endMonthString}-${endDayString}&page=1&pageSize=1`)
            .set("Authorization", `Bearer ${associateToken}`);
        expect(resPage1.status).toBe(200);
        expect(resPage1.body.events.length).toBe(1);
        expect(resPage1.body.events[0].id).toBe("T01");
        expect(resPage1.body.numPages).toBe(2);
        const resPage2 = await request(app)
            .get(`/api/client/${clientId}/event?from=${beginYear}-${beginMonthString}-${beginDayString}&to=${endYear}-${endMonthString}-${endDayString}&page=2&pageSize=1`)
            .set("Authorization", `Bearer ${associateToken}`);
        expect(resPage2.status).toBe(200);
        expect(resPage2.body.events.length).toBe(1);
        expect(resPage2.body.events[0].id).toBe("T02");
        expect(resPage2.body.numPages).toBe(2);
    });

    it("should handle server errors", async () => {
        jest.spyOn(require("../../../services/client.service"), "getClientEventsInDateRange")
            .mockRejectedValue(new Error("Database connection failed"));
        const res = await request(app)
            .get(`/api/client/${clientId}/event`)
            .set("Authorization", `Bearer ${associateToken}`);
        expect(res.status).toBe(500);
    })
});
