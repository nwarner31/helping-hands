import prisma from "../utility/prisma";
import {Event, MedicalEvent} from "@prisma/client";

export const setupTestEvents = async (...clientIDs: string[]) => {
    const events: Event[] = [
        {
            id: "e1",
            description: "Event 1",
            beginDate: new Date("2026-06-10T00:00"),
            beginTime: new Date("2000-01-01T10:00"),
            endDate: new Date("2026-06-10T00:00"),
            endTime: new Date("2000-01-01T11:00"),
            type: "WORK",
            numberStaffRequired: 2,
            clientId: clientIDs[0],
        },
        {
            id: "e2",
            description: "Event 2",
            beginDate: new Date("2026-06-10T00:00"),
            beginTime: new Date("2000-01-01T10:30"),
            endDate: new Date("2026-06-10T00:00"),
            endTime: new Date("2000-01-01T11:30"),
            type: "MEDICAL",
            numberStaffRequired: 1,
            clientId: clientIDs[1],
        },
        {
            id: "e3",
            description: "Event 3",
            beginDate: new Date("2026-06-11T00:00"),
            beginTime: new Date("2000-01-01T12:00"),
            endDate: new Date("2026-06-11T00:00"),
            endTime: new Date("2000-01-01T13:00"),
            type: "SOCIAL",
            numberStaffRequired: 0,
            clientId: clientIDs[2],
        }
    ];
    await prisma.medicalEvent.deleteMany();
    await prisma.event.deleteMany();
    await prisma.event.createMany({
        data: events,
        skipDuplicates: true,
    });

    const medicalEvents: MedicalEvent[] = [
        {
            id: "e2",
            doctor: "Sam Williams",
            doctorType: "Cardiologist",
            recordNumber: "r1",
            appointmentForCondition: "High Blood Pressure",
            recordPrintedDate: null,
            recordPrintedEmpId: null,
            recordTakenToHouseDate: null,
            recordTakenEmpId: null,
            appointmentCompletedByEmpId: null,
            recordFiledDate: null,
            recordFiledEmpId: null,
            appointmentResults: null
        }];
    await prisma.medicalEvent.create({
        data: medicalEvents[0]
    });
}

export const teardownTestEvents = async () => {
    await prisma.medicalEvent.deleteMany();
    await prisma.event.deleteMany();
}