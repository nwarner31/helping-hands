import { Request, Response, NextFunction } from "express";
import {
    addHouse,
    addHouseClient, addHouseManager,
    checkForDuplicateHouse, getAvailableManagers,
    getHouseByHouseId,
    getHouses, removeHouseClient, removeHouseManager,
    updateHouse
} from "../services/house.service";
import {House} from "@prisma/client";
import {getClientByClientId} from "../services/client/client.service";
import advanceTimersToNextTimerAsync = jest.advanceTimersToNextTimerAsync;
import {HouseSchema} from "../validation/house.validation";

interface HouseErrors {
    id?: string;
    name?: string;
    street1?: string;
    city?: string;
    state?: string;
    maxClients?: string;
    femaleEmployeeOnly?: string;
}


export const createHouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parseResult = HouseSchema.safeParse(req.body);
        if(!parseResult.success) {
            return next({status: 400, message: "Validation failed", errors: parseResult.error.format()});
        }
        const duplicate = await checkForDuplicateHouse(req.body.id, req.body.name);
        if(Object.keys(duplicate).length > 0) {
            return next({status: 400, message: "invalid data", errors: duplicate});
        }
        const newHouse = await addHouse(parseResult.data);
        res.status(201).json({message: "House successfully added", house: newHouse});
    } catch (error) {
        return next(error);
    }
}

export const getAllHouses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const houses = await getHouses();
        res.status(200).json({message: "houses successfully retrieved", houses: houses});
    } catch (error) {
        return next(error);
    }
}

export const getHouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const houseId = req.params.houseId;
        const house = await getHouseByHouseId(houseId);
        if(!house) return next({status: 404, message: "House not found"});
        res.status(200).json({message: "House found", house: house})
    } catch (error) {
        return next(error);
    }
}

export const putHouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const errors = validateHouseData(req.body);
        // if(Object.keys(errors).length > 0) {
        //     return next({status: 400, message: "invalid data", errors: errors});
        // }
        const parseResult = HouseSchema.safeParse(req.body);
        if(!parseResult.success) {
            return next({status: 400, message: "Validation failed", errors: parseResult.error.format()});
        }
        const houseIdCheck = await getHouseByHouseId(req.body.houseId);
        if (!houseIdCheck) return next({status: 400, message: "invalid data", errors: {houseId: "House ID not found"}});
        //const {clients, ...houseData} = { ...req.body };
        //houseData.maxClients = +houseData.maxClients;
        const updatedHouse = await updateHouse(parseResult.data);
        res.status(200).json({message: "House successfully updated", house: updatedHouse});
    } catch (error) {
        return next(error);
    }
}

export const addClientToHouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const houseId = req.params.houseId;
        const clientId = req.body.clientId;
        const houseIdCheck = await getHouseByHouseId(houseId);
        if(!houseIdCheck)  return next({status: 400, message: "invalid data", errors: {houseId: "House ID not found"}});
        const clientIdCheck = await getClientByClientId(clientId);
        if(!clientIdCheck) return next({status: 400, message: "invalid data", errors: {clientId: "Client ID not found"}});
        const house = await addHouseClient(houseIdCheck, clientId);
        res.status(209).json({message: "client added to house", house: house});
    } catch (error) {
        return next(error);
    }
}

export const removeClientFromHouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const houseId = req.params.houseId;
        const clientId = req.params.clientId;
        const houseIdCheck = await getHouseByHouseId(houseId);
        if(!houseIdCheck)  return next({status: 400, message: "invalid data", errors: {houseId: "House ID not found"}});
        const clientIdCheck = await getClientByClientId(clientId);
        if(!clientIdCheck) return next({status: 400, message: "invalid data", errors: {clientId: "Client ID not found"}});
        const house = await removeHouseClient(houseId, clientId);
        res.status(209).json({message: "client removed from house", house: house});
    } catch (error) {
        return next(error);
    }
}

export const getAvailableManagersForHouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const houseId = req.params.houseId;
        if (!houseId.trim()) return next({status: 400, message: "invalid data", errors: {houseId: "House ID is required"}});
        const houseIdCheck = await getHouseByHouseId(houseId);
        if(!houseIdCheck)  return next({status: 400, message: "invalid data", errors: {houseId: "House ID not found"}});
        const availableManagers = await getAvailableManagers(houseId);
        res.status(200).json({message: "available mangers found", managers: availableManagers});
    } catch (error) {
        return next(error);
    }
}

export const addManagerToHouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const houseId = req.params.houseId;
        const { employeeId, positionType } = req.body;

        if(!["primary", "secondary"].includes(positionType)) {
            return next({status: 400, message: "invalid data", errors: {positionType: "invalid position type"}});
        }

        const updatedHouse = await addHouseManager(houseId, employeeId, positionType);
        res.status(200).json({message: "manager added to house", house: updatedHouse});
    } catch (error) {
        return next(error);
    }
}

export const removeManagerFromHouse = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const houseId = req.params.houseId;
        const managerId = req.params.managerId;

        const updatedHouse = await removeHouseManager(houseId, managerId);
        res.status(200).json({message: "manager removed from house", house: updatedHouse})
    } catch (error) {
        return next(error);
    }
}



