import request from "supertest";
import app from "../../app";
import prisma from "../../utility/prisma";
import {eventSetupTests, eventTeardownTests} from "./event.setuptest";
import {TestEmployee} from "../setuptestemployees";
import {TestClient} from "../setuptestclients";


describe("GET /event/:eventId", () => {
    const ENDPOINT = "/api/event";
    let admin: TestEmployee;
    //let clients: TestClient[];
    let eventId = "E99999";
    beforeAll(async () => {
        const {employees, clients} = await eventSetupTests();
        admin = employees.admin;
        await prisma.event.create({
            data: {
                id: eventId,
                description: "Existing Event",
                beginDate: new Date("2023-09-01T10:00:00.000Z"),
                endDate: new Date("2023-09-01T11:00:00.000Z"),
                beginTime: new Date("2023-09-01T10:00:00.000Z"),
                endTime: new Date("2023-09-01T11:00:00.000Z"),
                type: "SOCIAL",
                clientId: clients.client1.id,
                numberStaffRequired: 1
            }
        });
    });

    afterAll(async () => {
        await prisma.event.deleteMany();
        await eventTeardownTests();
    });

    it("should return 400 if eventId param is missing or empty", async () => {
        const res = await request(app)
            .get(`${ENDPOINT}/%20`) // notice the space = trimmed empty
            .set("Authorization", `Bearer ${admin.token}`);
        console.log(res.body);
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Event Id is required/i);
    });

    it("should return 404 if event is not found", async () => {
        const res = await request(app)
            .get(`${ENDPOINT}/E12345`)
            .set("Authorization", `Bearer ${admin.token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/Event not found/i);
    });

    it("should return 200 and the event if found", async () => {

        const res = await request(app)
            .get(`${ENDPOINT}/${eventId}`)
            .set("Authorization", `Bearer ${admin.token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Event found");
        expect(res.body.event).toEqual(expect.objectContaining({
            id: eventId,
            type: "SOCIAL",
        }));
    });

    it("should return 401 for no token", async () => {

        const res = await request(app)
            .get(`${ENDPOINT}/${eventId}`);

        expect(res.status).toBe(401);
    });

    it("should bubble up server errors (500)", async () => {
        jest.spyOn(require("../../services/event.service"), "getEventById")
            .mockRejectedValue(new Error("Database connection failed"));

        const res = await request(app)
            .get(`${ENDPOINT}/${eventId}`)
            .set("Authorization", `Bearer ${admin.token}`);

        expect(res.status).toBe(500);
        expect(res.body.message).toMatch(/Database connection failed/i);
    });
})