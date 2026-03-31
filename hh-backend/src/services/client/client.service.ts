import {Client} from "@prisma/client";
import prisma from "../../utility/prisma";
import {checkClientEventConflicts} from "./clientEvent.service";
import {ClientResponse} from "../../types/client.type";

// Note: Ignored lines are intentional — they may later include logging or
// standardized error wrapping and will be tested at that time.
export const addClient = async (client: Client, log: any) => {
    try {
        const newClient = await prisma.client.create({
            data: { ...client }
        });
        log.info(`Client created: (Client: ${client.id})`)
        return newClient;
    } catch (error) {
        // istanbul ignore next
        throw error;
    }
}
export const getClients = async () => {
    try {
        return await prisma.client.findMany();

    } catch(error) {
        // istanbul ignore next
        throw error;
    }
}

export const getClientByClientId = async (clientId: string, employeeRole?: string) => {
    try {
        const today = new Date();
        const fourteenDaysFromNow = new Date(today);
        fourteenDaysFromNow.setDate(today.getDate() + 14);
        const client = await prisma.client.findUnique({
            where: { id: clientId },
            include: {
                house: {
                    include: {
                        _count: {select: {clients: true}},
                        clients: {where: {id: {not: clientId}}},
                        primaryHouseManager: {select: {id: true, name: true}},
                        secondaryHouseManager: {select: {id: true, name: true}}
                    }
                },
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

        if (!client) { return }
        const {_count, ...houseData} = client.house ? {...client.house, numClients: client.house._count.clients} : {_count: 0};
        const data: ClientResponse = {...client, dateOfBirth: client.dateOfBirth.toISOString().split("T")[0]};
        if(Object.keys(houseData).length > 0){ data.house = houseData; }

        if(employeeRole && ["ADMIN", "DIRECTOR", "MANAGER"].includes(employeeRole)) {
            data.hasConflicts = await checkClientEventConflicts(clientId);

        }
        return data;

    } catch(error) {
        // istanbul ignore next
        throw error;
    }
}

export const getClientEventsInDateRange = async (clientId: string, startDate: Date, endDate: Date) => {
    try {
        return await prisma.event.findMany({
            where: {
                clientId: clientId,
                beginDate: {gte: startDate, lte: endDate},
            },
            orderBy: {beginDate: "asc"},
            include: {
                medical: true
            }
        });
    } catch (error) {
        // istanbul ignore next
        throw error;
    }
}

export const updateClient = async (client: Client, log: any) => {
    try {
        const updatedClient = await prisma.client.update({where: {id: client.id}, data: client});
        log.info(`Client updated: (Client: ${client.id})`)
        return updatedClient;
    } catch(error) {
        // istanbul ignore next
        throw error;
    }
}

export const getHomelessClients = async () => {
    try {
        return await prisma.client.findMany({where: {houseId: null}});

    } catch (error) {
        // istanbul ignore next
        throw error;
    }
}