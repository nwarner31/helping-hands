import {Event, MedicalEvent} from "@prisma/client";
import prisma from "../utility/prisma";
import {HttpError} from "../utility/httperror";
import {EventInput} from "../validation/event.validation";
import {convertTimeToDate} from "../utility/dataFormat.utility";

// Note: Ignored lines are intentional — they may later include logging or
// standardized error wrapping and will be tested at that time.
export const addEvent = async (eventData: EventInput) => {
    try {
        return await prisma.$transaction(async (tx) => {
            const { medical, clientId, ...event } = eventData;
            const beginTime = convertTimeToDate(event.beginTime);
            const endTime = convertTimeToDate(event.endTime);
            const newEvent = await tx.event.create({
                data: {
                    ...event,
                    beginTime,
                    endTime,
                    client: {
                        connect: { id: clientId },
                    },
                },
            });

            if (medical) {
                await tx.medicalEvent.create({
                    data: {
                        ...medical,
                        id: newEvent.id,
                    },
                });
            }

            return newEvent;
        });
    } catch (error) {
        // istanbul ignore next
        throw error;
    }
}

export const updateEvent = async (eventData: EventInput) => {
    try {
        return await prisma.$transaction(async (tx) => {
            const { medical, clientId, ...event } = eventData;
            const beginTime = convertTimeToDate(event.beginTime);
            const endTime = convertTimeToDate(event.endTime);
            const updatedEvent = await tx.event.update({
                where: { id: event.id },
                data: {
                    ...event,
                    beginTime,
                    endTime,
                    client: {
                        connect: { id: clientId },
                    },
                },
            });

            if (medical) {
                await tx.medicalEvent.upsert({
                    where: { id: event.id },
                    create: {
                        ...medical,
                        id: event.id,
                    },
                    update: {
                        ...medical,
                    },
                });
            }

            return updatedEvent;
        });
    } catch (error) {
        // istanbul ignore next
        throw error;
    }
}

export const getEventById = async (eventId: string) => {
    try {
        return await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                medical: {
                    include: {
                        recordPrintedBy: {select: {id: true, name: true}},
                        recordTakenToHouseBy: {select: {id: true, name: true}},
                        recordFiledBy: {select: {id: true, name: true}}
                    }
                },
                client: true,
            },
        });
    } catch (error) {
        // istanbul ignore next
        throw error;
    }
}

export const recordEventAction = async (eventId: string, empId: string, action: string, results?: string) => {
    try {
        const event = await prisma.event.findUnique({where: {id: eventId}, include: {medical: true}});
        if (!event) {
            throw new HttpError(404, "Event not found");
        }
        if (event.type !== "MEDICAL") {
            throw new HttpError(400, "Event type is invalid");
        }
        const validActions = ["PRINT", "TAKE_TO_HOUSE", "FILE"];
        if (!validActions.includes(action)) {
            throw new HttpError(400, "Event action is invalid");
        }
        if (action === "FILE" && !results) {
            throw new HttpError(400, "Results are required for FILE action");
        }
        let updateData = {}
        if (action === "PRINT") { updateData = {recordPrintedEmpId: empId, recordPrintedDate: new Date()} }
        else if (action === "TAKE_TO_HOUSE") { updateData = {recordTakenEmpId: empId, recordTakenToHouseDate: new Date()} }
        else if (action === "FILE") { updateData = {recordFiledEmpId: empId, recordFiledDate: new Date(), appointmentResults: results} }
        await prisma.medicalEvent.update({
            where: { id: eventId },
            data: updateData,
        });
        return await getEventById(eventId);
    } catch (error) {
        // istanbul ignore next
        throw error;
    }
}