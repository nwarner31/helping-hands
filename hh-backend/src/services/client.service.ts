import { Client} from "@prisma/client";
import prisma from "../utility/prisma";


export const addClient = async (client: Client) => {
    try {
        return await prisma.client.create({
            data: { ...client }
        });
    } catch (error) {
        throw error;
    }
}
export const getClients = async () => {
    try {
        return await prisma.client.findMany();
    } catch(error) {
        throw error;
    }
}

export const getClientByClientId = async (clientId: string) => {
    try {
        if (!clientId.trim()) {
            throw new Error("Client ID is required");
        }
        if (typeof clientId !== "string") {
            throw new Error("Client ID must be a string");
        }

        const today = new Date();
        const fourteenDaysFromNow = new Date(today);
        fourteenDaysFromNow.setDate(today.getDate() + 14);
        return  await prisma.client.findUnique({
            where: { id: clientId },
            include: {
                house: true,
                events: {
                    where: {
                        beginDate: {
                            gte: today,
                            lte: fourteenDaysFromNow
                        }
                    }
                }
            }
        });


        //return await prisma.client.findUnique({where: {id: clientId}});
    } catch(error) {
        throw error;
    }
}

export const updateClient = async (client: Client) => {
    try {
        return await prisma.client.update({where: {id: client.id}, data: client});
    } catch(error) {
        throw error;
    }
}

export const getHomelessClients = async () => {
    try {
        return await prisma.client.findMany({where: {houseId: null}});
    } catch (error) {
        throw error;
    }
}