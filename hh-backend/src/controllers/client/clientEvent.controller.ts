import { Request, Response, NextFunction } from "express";
import {FullEventSchema, eventQuerySchema } from "../../validation/event.validation";
import {addEvent, getEventById} from "../../services/event.service";
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

        const eventWithSameId = await getEventById(req.body.id);
        if(eventWithSameId) {
            return next({status: 400, message: "invalid data", errors: {id: "Event ID already exists"}});
        }

        const newEvent = await addEvent(parseResult.data);

        res.status(201).json({ message: "Event created", data: newEvent });
    } catch (error) {
        return next(error);
    }

}

export const getEventsForClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clientId = req.params.clientId;
        // Checks for client
        const client = await getClientByClientId(clientId);
        if (!client) {
            return next({status: 404, message: "Client not found"});
        }
        // Validate query params
        const queryData = {month: req.query.month, toDate: req.query.to, fromDate: req.query.from};
        const { success, error, data } = eventQuerySchema.safeParse(queryData);
        if (!success) {
            return next({status: 400, message: "Validation failed", errors: flattenErrors(error)});
        }
        const {month, fromDate, toDate} = data;
        const { from, to } = getDateRange(month, fromDate, toDate);
        // Fetch events from service
        const events = await getClientEventsInDateRange(clientId, from, to);

        res.status(200).json({ message:"Events found", data: events });
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
        res.status(200).json({ message: "Events found", events: client.events });
    } catch (error) {
        return next(error);
    }
}

const clientEventConflictHelper = async (req: Request) => {
    try {
        // Checks for client
        const client = await getClientByClientId(req.params.clientId);
        if (!client) {
            return {success: false, data: {status: 404, message: "Client error", errors: "Client not found"}};
        }
        const {beginDate, endDate} = req.query;
        let begin = new Date();
        let end: Date | undefined;

        // Validate beginDate
        if (beginDate) {
            const parsed = new Date(beginDate as string);
            if (isNaN(parsed.getTime())) {
                return {success: false, data: {status: 400, message: "Invalid data", errors: "Invalid beginDate"}}
            }
            begin = parsed;
        }

        // Validate endDate
        if (endDate) {
            const parsed = new Date(endDate as string);
            if (isNaN(parsed.getTime())) {
                return {success: false, data: {status: 400, message: "Invalid data", errors: "Invalid endDate"}}
            }
            end = parsed;
        } else {
            end = addDays(begin, 14);
        }

        if (end < begin) {
            return {success: false, data: {status: 400, message: "Invalid data", errors: "End date must be after begin date"}};
        }
        return {success: true, data: {clientId: client.id, begin: begin, end: end}}
    } catch (error) {
        return {success: false, data: {status: 500, message: "Server Error", errors: "Internal server error"}}
    }
}

export const checkForClientEventConflicts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await clientEventConflictHelper(req);

        if(!data.success) {
            next(data.data);
            return;
        }
        const {clientId, begin, end} = data.data;
        // Run the service
        const conflicts = await checkClientEventConflicts(clientId!,  begin, end );

        res.status(200).json({
            message: "Event conflict data found",
            conflicts,
        });

    } catch (err) {
        res.status(500).json({ message: "Server Error", errors: "Internal server error" });
        return;
    }
}

export const getClientEventConflictData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await clientEventConflictHelper(req);

        if(!data.success) {
            next(data.data);
            return;
        }
        const {clientId, begin, end} = data.data;

        const conflicts = await getClientEventConflicts(clientId!,  begin, end );
        res.status(200).json({message: "Event conflict data found", data: conflicts});
    } catch (error) {
        res.status(500).json({ message: "Server Error", errors: "Internal server error" });
        return;
    }
}
