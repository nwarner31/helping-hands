import {eventSetupTests, eventTeardownTests} from "./event.setuptest";
import {TestEmployee} from "../setuptestemployees";
import prisma from "../../utility/prisma";
import {TestClient} from "../setuptestclients";
import request from "supertest";
import app from "../../app";


describe("PUT /events/:id - update event", () => {
    let eventId = "E99999";
    const endpoint = "/api/event";
    let admin: TestEmployee;
    let associate: TestEmployee;
    let client: TestClient;
    const testEventData = {
        id: eventId,
        description: "Test description",
        beginDate: new Date("2023-09-01T10:00:00.000Z"),
        endDate: new Date("2023-09-01T11:00:00.000Z"),
        beginTime: new Date("2023-09-01T10:00:00.000Z"),
        endTime: new Date("2023-09-01T11:00:00.000Z"),
        numberStaffRequired: 1
    }
    beforeAll(async () => {
        const {employees, clients} = await eventSetupTests();
        admin = employees.admin;
        associate = employees.associate;
        client = clients.client1;
    });
    beforeEach(async () => {
        await prisma.event.create({
            data: {
                ...testEventData,
                type: "SOCIAL",
                clientId: client.id
            }
        });
    });
    afterEach(async () => {
        await prisma.event.deleteMany();
    });
    afterAll(async () => {
        await eventTeardownTests();
    });
    it("should update event successfully for ADMIN", async () => {
        const res = await request(app)
            .put(`${endpoint}/${eventId}`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send({
                ...testEventData,
                description: "Updated description",
                type: "SOCIAL",
                beginTime: "10:00",
                endTime: "11:00",
                clientId: client.id});
        console.log(res.body);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Event updated");
        expect(res.body).toHaveProperty("event");
        expect(res.body.event.id).toBe(eventId);
    });
    it("should return 401 if no token provided", async () => {
        const res = await request(app)
            .put(`${endpoint}/${eventId}`)
            .send({
                ...testEventData,
                description: "Updated description",
                type: "SOCIAL",
                beginTime: "10:00",
                endTime: "11:00",
                clientId: client.id});
        expect(res.status).toBe(401);
    });
    it("should return 403 for non-ADMIN users", async () => {
        const res = await request(app)
            .put(`${endpoint}/${eventId}`)
            .set("Authorization", `Bearer ${associate.token}`)
            .send({
                ...testEventData,
                description: "Updated description",
                type: "SOCIAL",
                beginTime: "10:00",
                endTime: "11:00",
                clientId: client.id});
        expect(res.status).toBe(403);
    });
    const requiredFields = [
        "id",
        "type",
        "description",
        "beginDate",
        "endDate",
        "beginTime",
        "endTime",
        "numberStaffRequired",
    ];

    requiredFields.forEach((field) => {
        const validEvent = {
            ...testEventData,
            description: "Updated description",
            type: "SOCIAL",
            beginTime: "10:00",
            endTime: "11:00",
        };
        it(`should return 400 when '${field}' is missing`, async () => {
            const invalidData = { ...validEvent };
            delete invalidData[field as keyof typeof validEvent];

            const response = await request(app)
                .put(`${endpoint}/${validEvent.id}`)
                .set("Authorization", `Bearer ${admin.token}`)
                .send({...invalidData, clientId: client.id});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("errors");
            console.log(response.body);
            expect(response.body.errors).toHaveProperty(field);
        });
    });
    it("should return 400 if the event id and the param id do not match", async () => {
        const res = await request(app)
            .put(`${endpoint}/${eventId}`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send({
                ...testEventData,
                id: "E54321",
                description: "Updated description",
                type: "SOCIAL",
                beginTime: "10:00",
                endTime: "11:00",
                clientId: client.id});
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch("Event ID in URL and body do not match");
    });
    it("should return 400 if the event id is not in the url", async () => {
        const res = await request(app)
            .put(`${endpoint}/%20`) // space = trimmed empty
            .set("Authorization", `Bearer ${admin.token}`)
            .send({
                ...testEventData,
                description: "Updated description",
                type: "SOCIAL",
                beginTime: "10:00",
                endTime: "11:00",
                clientId: client.id});
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch("Event Id is required");
    });
    it("should handle service errors", async () => {
        jest.spyOn(require("../../services/event.service"), "updateEvent")
            .mockRejectedValueOnce(new Error("Database error"));

        const res = await request(app)
            .put(`${endpoint}/${eventId}`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send({
                ...testEventData,
                description: "Updated description",
                type: "SOCIAL",
                beginTime: "10:00",
                endTime: "11:00",
                clientId: client.id});

        expect(res.status).toBe(500);
        expect(res.body.message).toMatch("Database error");
    })
});