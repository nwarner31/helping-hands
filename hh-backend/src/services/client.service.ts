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