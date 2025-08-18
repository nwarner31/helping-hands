import {Event, MedicalEvent} from "@prisma/client";
import prisma from "../utility/prisma";
import {HttpError} from "../utility/httperror";
import {EventInput} from "../validation/event.validation";
import {convertTimeToDate} from "../utility/dataFormat.utility";

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
        throw error;
    }
}
