import { Request, Response, NextFunction } from "express";
import {FullEventSchema} from "../../validation/event.validation";
import { addEvent } from "../../services/event.service";

interface MedicalEventErrors {
    recordNumber?: string;
    doctor?: string;
    doctorType?: string;
    appointmentForCondition?: string;
}

interface EventErrors {
    id?: string;
    type?: string;
    description?: string;
    beginDate?: string;
    endDate?: string;
    beginTime?: string;
    endTime?: string;
    numberStaffRequired?: string;
    medical?: MedicalEventErrors;
}

// const validateEventData = (event: EventInput) => {
//     const errors: EventErrors = {};
//     if (event.id.trim() === "") {
//         errors.id = "An event requires an id";
//     }
//     if (event.type.trim() === "") {
//         errors.type = "An event requires a type";
//     } else if (!["WORK", "MEDICAL", "SOCIAL", "OTHER"].includes(event.type)) {
//         errors.type = "Invalid event type";
//     }
//     if (event.description.trim() === "") {
//         errors.description = "An event requires a description";
//     }
//     if (event.beginDate.trim() === "") {
//         errors.beginDate = "An event requires a begin date";
//     }
// }

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Parse + validate incoming data:
        const rawData = {
            ...req.body,
            clientId: req.params.clientId,
        };

        const parseResult = FullEventSchema.safeParse(rawData);

        if (!parseResult.success) {
            // Validation failed — send errors
            // return res.status(400).json({
            //     error: "Validation failed",
            //     details: parseResult.error.format(),
            // });
            return next({status: 400, message: "Validation failed", errors: parseResult.error?.format()});
        }

        const newEvent = await addEvent(parseResult.data);

        res.status(201).json({ message: "Event created", event: newEvent });
    } catch (error) {
        console.error("Unexpected error:", error);
        return next(error);
        // res.status(500).json({ error: "Internal server error" });
    }
}