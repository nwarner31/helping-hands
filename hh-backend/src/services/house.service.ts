import { House } from "@prisma/client";
import prisma from "../utility/prisma";

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

export const checkForDuplicateHouse = async (houseId: string, name: string) => {
    try {
        const errors: { [key: string]: string } = {};

        const existingHouseId = await prisma.house.findFirst({where: {houseId: houseId}});
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