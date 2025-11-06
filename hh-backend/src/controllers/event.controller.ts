import {Request, Response, NextFunction} from "express";
import {getEventById} from "../services/event.service";


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