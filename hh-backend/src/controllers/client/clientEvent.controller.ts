import { Request, Response, NextFunction } from "express";
import {FullEventSchema, eventQuerySchema, flattenErrors} from "../../validation/event.validation";
import {addEvent } from "../../services/event.service";
import {getClientByClientId, getClientEventsInDateRange} from "../../services/client.service";
import {getDateRange} from "../../tests/utlity/dataTransforms/date.transforms";



export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Parse + validate incoming data:
        const rawData = {
            ...req.body,
            clientId: req.params.clientId,
        };

        const parseResult = FullEventSchema.safeParse(rawData);

        if (!parseResult.success) {
            return next({status: 400, message: "Validation failed", errors: parseResult.error.format()});
        }

        const newEvent = await addEvent(parseResult.data);

        res.status(201).json({ message: "Event created", event: newEvent });
    } catch (error) {
        return next(error);
    }

}

export const getEventsForClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Checks for client
        const client = await getClientByClientId(req.params.clientId);
        if (!client) {
            return next({status: 404, message: "Client not found."});
        }
        // Validate query params
        const queryData = {month: req.query.month, toDate: req.query.to, fromDate: req.query.from};
        const { success, error, data } = eventQuerySchema.safeParse(queryData);
        if (!success) {
            return next({status: 400, message: "Validation failed", errors: flattenErrors(error)});
        }
        const {month, fromDate, toDate} = data;
        const { from, to } = getDateRange(month, fromDate, toDate);
        const pageNum = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        // Fetch events from service
        const { events, numPages, count } = await getClientEventsInDateRange(
            req.params.clientId,
            from,
            to,
            pageNum,
            pageSize,
        );

        res.status(200).json({ message:"Events found", events, numPages, count });
    } catch (err) {
        return next(err);
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
