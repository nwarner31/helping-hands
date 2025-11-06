import prisma from "../../../utility/prisma";
import request from "supertest";
import app from "../../../app";
import { clientSetupTests, clientTeardownTests } from "../client.setuptest";
import {addEvent} from "../../../services/event.service";
import {TestEmployee} from "../../setuptestemployees";
import {setupTestClients, teardownTestClients } from "../../setuptestclients";
import {Client} from "@prisma/client";

describe("Client Routes - Add Event", () => {
    let testClient: Client;
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

    let admin: TestEmployee;
    let associate: TestEmployee;

    beforeAll(async () => {

        const employees = await clientSetupTests();
        admin = employees.admin;
        associate = employees.associate;

        const clients = await setupTestClients();
        testClient = clients.client1;
    });

    beforeEach(async () => {
        await prisma.medicalEvent.deleteMany();
        await prisma.event.deleteMany();
    });

    afterAll(async () => {
        await prisma.medicalEvent.deleteMany();
        await prisma.event.deleteMany();
        await teardownTestClients();
        await clientTeardownTests();
    });

    it("should successfully create a work event with valid data and admin", async () => {
        const response = await request(app)
            .post(`/api/client/${testClient.id}/event`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send(validEvent);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("event");
        expect(response.body.message).toBe("Event created");
    });

    it("should return 401 if no token provided", async () => {
        const response = await request(app)
            .post(`/api/client/${testClient.id}/event`)
            .send(validEvent);

        expect(response.status).toBe(401);
    });

    it("should return 403 if user is not an admin", async () => {
        const response = await request(app)
            .post(`/api/client/${testClient.id}/event`)
            .set("Authorization", `Bearer ${associate.token}`)
            .send(validEvent);

        expect(response.status).toBe(403);
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
        it(`should return 400 when '${field}' is missing`, async () => {
            const invalidData = { ...validEvent };
            delete invalidData[field as keyof typeof validEvent];

            const response = await request(app)
                .post(`/api/client/${testClient.id}/event`)
                .set("Authorization", `Bearer ${admin.token}`)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("errors");
            expect(response.body.errors).toHaveProperty(field);
        });
    });

    it("should return 400 when numberStaffRequired is not a number", async () => {
        const invalidData = { ...validEvent, numberStaffRequired: "two" };

        const response = await request(app)
            .post(`/api/client/${testClient.id}/event`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send(invalidData);

        expect(response.status).toBe(400);
        expect(response.body.errors).toHaveProperty("numberStaffRequired");
    });

    it("should return 400 when beginDate is in invalid format", async () => {
        const invalidData = { ...validEvent, beginDate: "not-a-date" };

        const response = await request(app)
            .post(`/api/client/${testClient.id}/event`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send(invalidData);

        expect(response.status).toBe(400);
        expect(response.body.errors).toHaveProperty("beginDate");
    });

    it("should return 400 if event type is MEDICAL but medical data is missing", async () => {
        const invalidData = { ...validEvent, type: "MEDICAL", medical: undefined };

        const response = await request(app)
            .post(`/api/client/${testClient.id}/event`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send(invalidData);

        expect(response.status).toBe(400);
        expect(response.body.errors).toHaveProperty("medical");
    });

    it("should return 201 when type is MEDICAL and medical is included", async () => {
        const response = await request(app)
            .post(`/api/client/${testClient.id}/event`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send({
                ...validEvent,
                type: "MEDICAL",
                medical: {
                    recordNumber: "MED123",
                    doctor: "Dr. Who",
                    doctorType: "Specialist",
                    appointmentForCondition: "Checkup",
                },
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("event");
        expect(response.body.message).toBe("Event created");
    });

    it("should handle server errors", async () => {
        jest.spyOn(require("../../../services/event.service"), "addEvent")
            .mockRejectedValue(new Error("Database connection failed"));

        const response = await request(app)
            .post(`/api/client/${testClient.id}/event`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send(validEvent);
        expect(response.status).toBe(500);
    });
});
