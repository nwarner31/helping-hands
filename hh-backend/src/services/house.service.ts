import { House } from "@prisma/client";
import prisma from "../utility/prisma";
import {HttpError} from "../utility/httperror";

export const addHouse = async (house: House) => {
    try {
        const newHouse = await prisma.house.create({
            data: { ...house }
        });
        return newHouse;
    } catch (error) {
        throw error;
    }
}

export const getHouses = async () => {
    try {
        return await prisma.house.findMany({include: {clients: true, primaryHouseManager: true, secondaryHouseManager: true}});
    } catch (error) {
        throw error;
    }
}

export const updateHouse = async (house: House) => {
    try {
        const houseCheck = await prisma.house.findFirst({where: {id: house.id}});
        if (!houseCheck) throw {status: 400, message: "invalid data"};
        return await prisma.house.update({where: {id: house.id}, data: house});
    } catch (error) {
        throw error;
    }
}

export const getHouseByHouseId = async (houseId: string) => {
    try {
        return await prisma.house.findFirst({where: {id: houseId},include: {clients: true}});
    } catch (error) {
        throw error;
    }
}

export const addHouseClient = async (house: House, clientId: string) => {
    try {
        await prisma.client.update({where: {id: clientId}, data: {houseId: house.id}});
        return await getHouseByHouseId(house.id);
    } catch (error) {
        throw error;
    }
}

export const removeHouseClient = async (houseId: string, clientId: string) => {
    try {
        await prisma.client.update({where: {id: clientId}, data: {houseId: null}});
        return await getHouseByHouseId(houseId);
    } catch (error) {
        throw error;
    }
}

export const getAvailableManagers = async (houseId: string) => {
    try {
        if(!houseId) throw new HttpError(400, "invalid data",{houseId: "No House ID provided"});
        // Check for the house
        const house = await prisma.house.findFirst({where: {id: houseId}});
        if(!house) throw new HttpError(400, "invalid data", {houseId: "House ID does not exist"});

        const managers = await prisma.employee.findMany({where: {position: "MANAGER"}, include: {primaryHouses: true, secondaryHouses: true}});

        return managers.filter(manager => {
            console.log(manager.id);
            console.log(house.primaryManagerId);
            console.log(manager.id !== house.primaryManagerId);
            return manager.id !== house.primaryManagerId && manager.id !== house.secondaryManagerId
        }
          );
    } catch (error) {
        throw error;
    }

}

export const addHouseManager = async (houseId: string, employeeId: string, positionType: string) => {
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

        return await prisma.house.update({where: {id: houseId}, data: updateData,
            include: { primaryHouseManager: true, secondaryHouseManager: true }});
    } catch (error) {
        throw error;
    }
}

export const removeHouseManager = async (houseId: string, managerId: string) => {
    try {
        // Check for house
        const house = await prisma.house.findFirst({where: {id: houseId}});
        if(!house) throw new HttpError(400, "invalid input", {houseId: "House ID does not exist"});

        const manager = await prisma.employee.findFirst({where: {id: managerId}});
        if(!manager) throw new HttpError(400, "invalid input", {managerId: "Manager ID does not exist"})
        const updateData: any = {};
        if(house.primaryManagerId === manager.id) {
            updateData.primaryManagerId = null;
        } else if (house.secondaryManagerId === manager.id) {
            updateData.secondaryManagerId = null;
        } else {
            throw new HttpError(400, "invalid input", {employeeId: "Employee is not a manager in the house"});
        }

        // Error check to make sure
        if (Object.keys(updateData).length === 0) {
            throw new HttpError(500, "server error")
        }

        return await prisma.house.update({where: {id: houseId}, data: updateData,
            include: { primaryHouseManager: true, secondaryHouseManager: true }});
    } catch (error) {
        throw error;
    }
}

export const checkForDuplicateHouse = async (houseId: string, name: string) => {
    try {
        const errors: { [key: string]: string } = {};

        const existingHouseId = await prisma.house.findFirst({where: {id: houseId}});
        if(existingHouseId) {
            errors.houseId = "House ID already in use";
        }
        const existingHouseName = await prisma.house.findFirst({where: {name: name}});
        if(existingHouseName) {
            errors.name = "House Name already in use";
        }

        return errors;
    } catch(error) {
        throw error;
    }
}
