import {Request, Response, NextFunction} from "express";
import {getEventById, updateEvent} from "../services/event.service";
import {FullEventSchema} from "../validation/event.validation";


export const getEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const eventId = req.params.eventId;
        if (!eventId.trim()) return next({status: 400, message: "Event Id is required"});
        const event = await getEventById(eventId);
        if(!event) return next({status: 404, message: "Event not found"});
        res.status(200).json({message: "Event found", event: event});
    } catch(error) {
        return next(error);
    }
}

export const putEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const eventId = req.params.eventId;
        const eventData = req.body;
        const parseResult = FullEventSchema.safeParse(eventData);
        if (!eventId.trim()) return next({status: 400, message: "Event Id is required", errors: {id: "Event ID cannot be empty"}});
        if (eventId !== eventData.id) return next({status: 400, message: "Event ID in URL and body do not match", errors: {id: "Event ID in URL and body do not match"}});
        if (!parseResult.success) {
            console.log(parseResult.error.format())
            return next({status: 400, message: "Validation failed", errors: parseResult.error.format()});
        }
        const updatedEvent = await updateEvent(parseResult.data);
        res.status(200).json({message: "Event updated", event: updatedEvent});
    } catch(error) {
        return next(error);
    }
}