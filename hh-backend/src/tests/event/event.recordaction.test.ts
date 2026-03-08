import request from "supertest";
import app from "../../app";
import prisma from "../../utility/prisma";
import {eventSetupTests, eventTeardownTests} from "./event.setuptest";
import {TestEmployee} from "../setuptestemployees";
import {TestClient} from "../setuptestclients";

describe("POST /event/:eventId/record-action", () => {
    const ENDPOINT = "/api/event";
    let admin: TestEmployee;
    let associate: TestEmployee;
    let client: TestClient;

    beforeAll(async () => {
        const {employees, clients} = await eventSetupTests();
        admin = employees.admin;
        associate = employees.associate;
        client = clients.client1;

        // create a medical event
        await prisma.event.create({
            data: {
                id: "MED-1",
                description: "Medical Event",
                beginDate: new Date("2024-01-01T10:00:00.000Z"),
                endDate: new Date("2024-01-01T11:00:00.000Z"),
                beginTime: new Date("2024-01-01T10:00:00.000Z"),
                endTime: new Date("2024-01-01T11:00:00.000Z"),
                type: "MEDICAL",
                clientId: client.id,
                numberStaffRequired: 1
            }
        });
        // create a non-medical event
        await prisma.event.create({
            data: {
                id: "WORK-1",
                description: "Work Event",
                beginDate: new Date("2024-01-02T10:00:00.000Z"),
                endDate: new Date("2024-01-02T11:00:00.000Z"),
                beginTime: new Date("2024-01-02T10:00:00.000Z"),
                endTime: new Date("2024-01-02T11:00:00.000Z"),
                type: "WORK",
                clientId: client.id,
                numberStaffRequired: 1
            }
        });

        // create corresponding medicalEvent record for MED-1
        await prisma.medicalEvent.create({
            data: {
                id: "MED-1",
                recordNumber: "m123",
                doctor: "Dr. Who",
                doctorType: "Primary",
                appointmentForCondition: "Checkup",
            }
        });
    });

    afterAll(async () => {
        await prisma.medicalEvent.deleteMany();
        await prisma.event.deleteMany();

        await eventTeardownTests();
    });

    it("should return 401 when not authenticated", async () => {
        const res = await request(app)
            .post(`${ENDPOINT}/MED-1/record-action`)
            .send({ action: "PRINT" });

        expect(res.status).toBe(401);
    });

    it("should return 403 for ASSOCIATE users", async () => {
        const res = await request(app)
            .post(`${ENDPOINT}/MED-1/record-action`)
            .set("Authorization", `Bearer ${associate.token}`)
            .send({ action: "PRINT" });

        expect(res.status).toBe(403);
    });

    it("should record PRINT action successfully", async () => {
        const res = await request(app)
            .post(`${ENDPOINT}/MED-1/record-action`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send({ action: "PRINT" });

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/Event action recorded/i);
        expect(res.body.event).toBeDefined();
        expect(res.body.event.medical.recordPrintedEmpId).toBe(admin.id);
        expect(res.body.event.medical.recordPrintedDate).toBeTruthy();
    });

    it("should record TAKE_TO_HOUSE action successfully", async () => {
        const res = await request(app)
            .post(`${ENDPOINT}/MED-1/record-action`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send({ action: "TAKE_TO_HOUSE" });

        expect(res.status).toBe(200);
        expect(res.body.event.medical.recordTakenEmpId).toBe(admin.id);
        expect(res.body.event.medical.recordTakenToHouseDate).toBeTruthy();
    });

    it("should return 400 for FILE action without results", async () => {
        const res = await request(app)
            .post(`${ENDPOINT}/MED-1/record-action`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send({ action: "FILE" });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Results are required for FILE action/i);
    });

    it("should record FILE action with results successfully", async () => {
        const res = await request(app)
            .post(`${ENDPOINT}/MED-1/record-action`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send({ action: "FILE", results: "All good" });

        expect(res.status).toBe(200);
        expect(res.body.event.medical.recordFiledEmpId).toBe(admin.id);
        expect(res.body.event.medical.recordFiledDate).toBeTruthy();
        expect(res.body.event.medical.appointmentResults).toBe("All good");
    });

    it("should return 400 for invalid action", async () => {
        const res = await request(app)
            .post(`${ENDPOINT}/MED-1/record-action`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send({ action: "INVALID_ACTION" });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Event action is invalid/i);
    });

    it("should return 400 for non-medical event type", async () => {
        const res = await request(app)
            .post(`${ENDPOINT}/WORK-1/record-action`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send({ action: "PRINT" });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Event type is invalid/i);
    });

    it("should return 404 when event not found", async () => {
        const res = await request(app)
            .post(`${ENDPOINT}/NOPE/record-action`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send({ action: "PRINT" });

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/Event not found/i);
    });

    it("should bubble up server errors (500)", async () => {
        jest.spyOn(require("../../services/event.service"), "recordEventAction")
            .mockRejectedValue(new Error("Database failed"));

        const res = await request(app)
            .post(`${ENDPOINT}/MED-1/record-action`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send({ action: "PRINT" });

        expect(res.status).toBe(500);
        expect(res.body.message).toMatch(/Database failed/i);
    });
});
