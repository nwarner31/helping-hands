import { Request, Response, NextFunction } from "express";
import {addClient, getClients, getClientByClientId, updateClient} from "../services/client.service";
import {Client} from "@prisma/client";

interface ClientErrors {
    clientId?: string;
    legalName?: string;
    dateOfBirth?: string;
}
const validateClientData = (client: Client) => {
    const errors: ClientErrors = {};

    if(!client.clientId || !client.clientId.trim()) {
        errors.clientId = "Client Id is required";
    }
    if(!client.legalName || !client.legalName.trim()) {
        errors.legalName = "Legal name is required";
    }
    if (client.dateOfBirth === undefined || client.dateOfBirth === null || client.dateOfBirth.toString().trim() === "") {
        errors.dateOfBirth = "Hire date is required.";
    } else if (isNaN(new Date(client.dateOfBirth).getTime())) {
        errors.dateOfBirth = "Hire date must be of a date format";
    }

    return errors;
}

export const createClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validateClientData(req.body);
        if(Object.keys(errors).length > 0) {
            return next({status: 400, message: errors})
        }
        const clientWithSameId = await getClientByClientId(req.body.clientId);
        if (clientWithSameId) {
            return next({status: 400, message: "invalid data", errors: {clientId: "Client ID already exists"}});
        }
        const clientData = req.body;
        clientData.dateOfBirth = new Date(clientData.dateOfBirth);
        const newClient = await addClient(clientData);
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
        throw error
    }
}

export const putClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validateClientData(req.body);
        if (Object.keys(errors).length > 0) {
            return next({status: 400, message: errors})
        }
        const clientData = { ...req.body};
        clientData.dateOfBirth = new Date(clientData.dateOfBirth);
        const updatedClient = await updateClient(clientData);
        res.status(200).json({message: "client updated successfully", client: updatedClient});
    } catch (error) {
        throw error;
    }
}
export const getClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clientId =  req.params.clientId;
        const client = await getClientByClientId(clientId);
        res.status(200).json({message: "client found", client: client});
    } catch(error) {
        throw error;
    }
}