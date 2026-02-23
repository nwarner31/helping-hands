import { Request, Response, NextFunction } from "express";
import {FullEventSchema, eventQuerySchema } from "../../validation/event.validation";
import {addEvent } from "../../services/event.service";
import {getClientByClientId, getClientEventsInDateRange} from "../../services/client/client.service";
import {getDateRange} from "../../tests/utlity/dataTransforms/date.transforms";
import {flattenErrors} from "../../validation/utility.validation";
import {checkClientEventConflicts, getClientEventConflicts} from "../../services/client/clientEvent.service";
import {addDays} from "date-fns";



export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Parse + validate incoming data:
        const rawData = {
            ...req.body,
            clientId: req.params.clientId,
        };

        const parseResult = FullEventSchema.safeParse(rawData);

        if (!parseResult.success) {
            console.log(parseResult.error.format())
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
        const pageNum = req.query.page ? Number(req.query.page) : 1;
        const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;
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

export const checkForClientEventConflicts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Checks for client
        const client = await getClientByClientId(req.params.clientId);
        if (!client) {
            next({status: 404, message: "Client error", errors: "Client not found"});
            return;
        }
        const {beginDate, endDate} = req.query;
        let begin = new Date();
        let end: Date | undefined;

        // Validate beginDate
        if (beginDate) {
            const parsed = new Date(beginDate as string);
            if (isNaN(parsed.getTime())) {
                res.status(400).json({ message: "Invalid data", errors: "Invalid beginDate" });
                return;
            }
            begin = parsed;
        }

        // Validate endDate
        if (endDate) {
            const parsed = new Date(endDate as string);
            if (isNaN(parsed.getTime())) {
                res.status(400).json({ message: "Invalid data", errors: "Invalid endDate" });
                return;
            }
            end = parsed;
        } else {
            end = addDays(begin, 14);
        }

        if(end < begin) {
            res.status(400).json({message: "Invalid data", errors: "End date must be after begin date"});
            return;
        }
        // Run the service
        const conflicts = await checkClientEventConflicts(client.id,  begin, end );

        res.status(200).json({
            message: "Event conflict data found",
            conflicts,
        });

    } catch (err) {
        res.status(500).json({ message: "Server Error", errors: "Internal server error" });
        return;
    }

}
