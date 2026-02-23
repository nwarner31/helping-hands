import { Request, Response, NextFunction } from "express";
import {addClient, getClients, getClientByClientId, updateClient, getHomelessClients} from "../../services/client/client.service";
import {ClientSchema} from "../../validation/client.validation";
import {flattenErrors} from "../../validation/utility.validation";
import {checkClientEventConflicts} from "../../services/client/clientEvent.service";

export const createClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parseResult = ClientSchema.safeParse(req.body);
        if (!parseResult.success) {
            return next({status: 400, message: "Validation failed", errors: flattenErrors(parseResult.error)});
        }
        const clientWithSameId = await getClientByClientId(req.body.id);
        if (clientWithSameId) {
            return next({status: 400, message: "invalid data", errors: {clientId: "Client ID already exists"}});
        }
        const newClient = await addClient(parseResult.data);
        res.status(201).json({message: "Client added", client: newClient})
    } catch (error) {
        return next(error);
    }

}

export const getAllClients = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clients = await getClients();
        res.status(200).json({message: "clients successfully retrieved", clients: clients});
    }
    catch (error) {
        return next(error);
    }
}

export const putClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parseResult = ClientSchema.safeParse(req.body);
        if (!parseResult.success) {
            console.log(parseResult.error.format());
            return next({status: 400, message: "Validation failed", errors: flattenErrors(parseResult.error)});
        }
        const updatedClient = await updateClient(parseResult.data);
        res.status(200).json({message: "client updated successfully", client: updatedClient});
    } catch (error) {
        return next(error);
    }
}
export const getClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clientId= req.params.clientId;
        const employeeRole = req.employee?.position ?? "";
        if (!clientId.trim()) return next({status: 400, message: "Invalid data", errors: "Client Id is required"});
        let client = await getClientByClientId(clientId, employeeRole);
        if(!client) return next({status: 404, message: "client not found"});

        res.status(200).json({message: "Client found", client: client});
    } catch(error) {
        return next(error);
    }
}

export const getAllUnhousedClients = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clients = await getHomelessClients();
        res.status(200).json({message: "clients found", clients: clients});
    } catch (error) {
        return next(error);
    }
}