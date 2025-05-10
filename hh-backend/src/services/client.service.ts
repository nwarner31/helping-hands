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
        return await prisma.client.findUnique({where: {clientId: clientId}});
    } catch(error) {
        throw error;
    }
}

export const updateClient = async (client: Client) => {
    try {
        return await prisma.client.update({where: {clientId: client.clientId}, data: client});
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