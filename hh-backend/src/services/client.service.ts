import { Client} from "@prisma/client";
import prisma from "../utility/prisma";


export const addClient = async (client: Client) => {
    try {
        const newClient = await prisma.client.create({
            data: { ...client }
        });
        return newClient;
    } catch (error) {
        throw error;
    }
}
export const getClients = async () => {
    try {
        const clients = await prisma.client.findMany();
        return clients;
    } catch(error) {
        throw error;
    }
}

export const getClientByClientId = async (clientId: string) => {
    try {
        const client = await prisma.client.findUnique({where: {clientId: clientId}});
        return client;
    } catch(error) {
        throw error;
    }
}

export const updateClient = async (client: Client) => {
    try {
        const updatedClient = await prisma.client.update({where: {clientId: client.clientId}, data: client});
        return updatedClient;
    } catch(error) {
        throw error;
    }
}