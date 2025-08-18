import { Request, Response, NextFunction } from "express";
import {FullEventSchema} from "../../validation/event.validation";
import {addEvent } from "../../services/event.service";
import {getClientByClientId} from "../../services/client.service";




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
    }

}

export const getUpcomingEventsForClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clientId = req.params.clientId;
        const client = await getClientByClientId(clientId);
        if (!client) {
            return next({ status: 404, message: "Client not found", errors: { clientId: "Client ID not found" } });
        }
        // const clientId = req.params.clientId;
        // const events = await getUpcomingEventsForClientId(clientId);
        // console.log(events);
        res.status(200).json({ message: "Events found", events: client.events });
    } catch (error) {
        return next(error);
    }
}
