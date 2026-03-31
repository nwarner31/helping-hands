import { House } from "@prisma/client";
import prisma from "../utility/prisma";
import {HttpError} from "../utility/httperror";

// Note: Ignored lines are intentional — they may later include logging or
// standardized error wrapping and will be tested at that time.
export const addHouse = async (house: House, log: any) => {
    try {
        const newHouse = await prisma.house.create({
            data: { ...house }
        });
        log.info(`House successfully created: ${house.id}-${house.name}`);
        return newHouse;
    } catch (error) {
        // istanbul ignore next
        throw error;
    }
}

export const getHouses = async () => {
    try {
        return await prisma.house.findMany({include: {clients: true, primaryHouseManager: true, secondaryHouseManager: true}});
    } catch (error) {
        // istanbul ignore next
        throw error;
    }
}

export const updateHouse = async (house: House, log: any) => {
    try {
        const houseWithSameName = await prisma.house.findFirst({where: {name: house.name}});
        if(houseWithSameName && houseWithSameName.id !== house.id) {
            throw new HttpError(400, "invalid input", {name: "House name already exists"});
        }
        const updatedHouse = await prisma.house.update({where: {id: house.id}, data: house,
            include: { primaryHouseManager: true, secondaryHouseManager: true, clients: true }});
        log.info(`House updated: (House: ${house.id})`);
        return updatedHouse;
    } catch (error) {
        // istanbul ignore next
        throw error;
    }
}

export const getHouseByHouseId = async (houseId: string) => {
    try {
        return await prisma.house.findFirst({where: {id: houseId},
            include: {clients: true, primaryHouseManager: true, secondaryHouseManager: true}});
    } catch (error) {
        // istanbul ignore next
        throw error;
    }
}

export const addHouseClient = async (house: House, clientId: string, log: any) => {
    try {
        await prisma.client.update({where: {id: clientId}, data: {houseId: house.id}});
        log.info(`Client added to house: (House: ${house.id}, Client: ${clientId})`);
        return await getHouseByHouseId(house.id);
    } catch (error) {
        // istanbul ignore next
        throw error;
    }
}

export const removeHouseClient = async (houseId: string, clientId: string, log: any) => {
    try {
        await prisma.client.update({where: {id: clientId}, data: {houseId: null}});
        log.info(`Client added to house: (House: ${houseId}, Client: ${clientId})`)
        return await getHouseByHouseId(houseId);
    } catch (error) {
        // istanbul ignore next
        throw error;
    }
}

export const getAvailableManagers = async (houseId: string) => {
    try {
        const house = await prisma.house.findFirst({where: {id: houseId}});
        const managers = await prisma.employee.findMany({where: {position: "MANAGER"}, include: {primaryHouses: true, secondaryHouses: true}});

        return managers.filter(manager => {
            return manager.id !== house!.primaryManagerId && manager.id !== house!.secondaryManagerId
        }
          );
    } catch (error) {
        // istanbul ignore next
        throw error;
    }

}

export const addHouseManager = async (houseId: string, employeeId: string, positionType: string, log: any) => {
    try {
        // Check for house
        const house = await prisma.house.findFirst({where: {id: houseId}});
        if(!house) throw new HttpError(400, "invalid input", {houseId: "House ID does not exist"});

        // Check employee for existence an is a manager
        const manager = await prisma.employee.findFirst({where: {id: employeeId}});
        if(!manager || manager.position !== "MANAGER") throw new HttpError(400, "invalid input", {employeeId: "Employee does not exist or is not a manager"});

        // Check if the employee is already a manager in the house
        if(house.primaryManagerId === manager.id || house.secondaryManagerId === manager.id) throw new HttpError(400, "invalid input", {employeeId: "Employee is already a manager in the house"});

        const updateData = positionType === "primary" ?
            {primaryManagerId: manager.id} :
            {secondaryManagerId: manager.id}

        const returnHouse = await prisma.house.update({where: {id: houseId}, data: updateData,
            include: { primaryHouseManager: true, secondaryHouseManager: true, clients: true }});
        const position = positionType.charAt(0).toUpperCase() + positionType.slice(1);
        log.info(`${position} manager has been added to house: (House: ${houseId}, Manager: ${employeeId})`)
        return returnHouse;
    } catch (error) {
        throw error;
    }
}

export const removeHouseManager = async (houseId: string, managerId: string, log: any) => {
    try {
        // Check for house
        const house = await prisma.house.findFirst({where: {id: houseId}});
        if(!house) throw new HttpError(400, "invalid input", {houseId: "House ID does not exist"});
        let position = "";
        const manager = await prisma.employee.findFirst({where: {id: managerId}});
        if(!manager) throw new HttpError(400, "invalid input", {managerId: "Manager ID does not exist"})
        const updateData: any = {};
        if(house.primaryManagerId === manager.id) {
            position = "Primary";
            updateData.primaryManagerId = null;
        } else if (house.secondaryManagerId === manager.id) {
            position = "Secondary";
            updateData.secondaryManagerId = null;
        } else {
            throw new HttpError(400, "invalid input", {employeeId: "Employee is not a manager in the house"});
        }
        // Error check to make sure
        // istanbul ignore next
        if (Object.keys(updateData).length === 0) {
            throw new HttpError(500, "server error")
        }

        const returnHouse = await prisma.house.update({where: {id: houseId}, data: updateData,
            include: { primaryHouseManager: true, secondaryHouseManager: true, clients: true }});
        log.info(`${position} manager removed from house: (House: ${houseId}, Manager: ${managerId})`)
        return returnHouse;
    } catch (error) {
        throw error;
    }
}

export const checkForDuplicateHouse = async (houseId: string, name: string) => {
    try {
        const errors: { [key: string]: string } = {};
        const existingHouseId = await prisma.house.findFirst({where: {id: houseId}});
        if(existingHouseId) {
            errors.id = "House ID already exists";
        }
        const existingHouseName = await prisma.house.findFirst({where: {name: name}});
        if(existingHouseName) {
            errors.name = "House Name already exists";
        }

        return errors;
    } catch(error) {
        // istanbul ignore next
        throw error;
    }
}
