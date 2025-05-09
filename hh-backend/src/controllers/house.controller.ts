import { Request, Response, NextFunction } from "express";
import {addHouse, checkForDuplicateHouse, getHouseByHouseId, getHouses, updateHouse} from "../services/house.service";
import {House} from "@prisma/client";

interface HouseErrors {
    houseId?: string;
    name?: string;
    street1?: string;
    city?: string;
    state?: string;
    maxClients?: string;
    femaleEmployeeOnly?: string;
}

const validateHouseData = (house: House) => {
    const errors: HouseErrors = {};
    if(!house.houseId || !house.houseId.trim()) {
        errors.houseId = "House ID is required";
    }

    if(!house.name || !house.name.trim()) {
        errors.name = "House Name is required";
    }

    if(!house.street1 || !house.street1.trim()) {
        errors.street1 = "Street 1 is required";
    }

    if(!house.city || !house.city.trim()) {
        errors.city = "A City is required";
    }

    if(!house.state || !house.state.trim()) {
        errors.state = "A State is required";
    }

    if(!house.maxClients || !house.maxClients.toString().trim()) {
        errors.maxClients = "Max Clients is required";
    } else if (+house.maxClients < 1) {
        errors.maxClients = "Max Clients must be 1 or greater";
    }

    if(typeof house.femaleEmployeeOnly !== "boolean") {
        errors.femaleEmployeeOnly = "Female Employee is a required field and is a boolean";
    }

    return errors;
}

export const createHouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validateHouseData(req.body);
        if(Object.keys(errors).length > 0) {
            return next({status: 400, message: "invalid data", errors: errors});
        }
        const duplicate = await checkForDuplicateHouse(req.body.houseId, req.body.name);
        if(Object.keys(duplicate).length > 0) {
            return next({status: 400, message: "invalid data", errors: duplicate});
        }
        const houseData = { ...req.body };
        houseData.maxClients = +houseData.maxClients;
        const newHouse = await addHouse(houseData);
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

export const putHouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validateHouseData(req.body);
        if(Object.keys(errors).length > 0) {
            return next({status: 400, message: "invalid data", errors: errors});
        }
        const houseIdCheck = await getHouseByHouseId(req.body.houseId);
        if (!houseIdCheck) return next({status: 400, message: "invalid data", errors: {houseId: "House ID not found"}});
        const {clients, ...houseData} = { ...req.body };
        houseData.maxClients = +houseData.maxClients;
        const updatedHouse = await updateHouse(houseData);
        res.status(200).json({message: "House successfully updated", house: updatedHouse});
    } catch (error) {
        console.log(error);
        return next(error);
    }
}

