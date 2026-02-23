import {Client} from "@prisma/client";
import prisma from "../../utility/prisma";
import {checkClientEventConflicts} from "./clientEvent.service";
import {ClientResponse} from "../../types/client.type";

// Note: Ignored lines are intentional — they may later include logging or
// standardized error wrapping and will be tested at that time.
export const addClient = async (client: Client) => {
    try {
        return await prisma.client.create({
            data: { ...client }
        });

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
                    include: {_count: {select: {clients: true}}}
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

export const getClientEventsInDateRange = async (clientId: string, startDate: Date, endDate: Date, pageNum: number, pageSize: number) => {
    try {
        const skip = (pageNum - 1) * pageSize;

        const events = await prisma.event.findMany({
            where: {
                clientId: clientId,
                beginDate : { gte: startDate, lte: endDate },
            },
            skip,
            take: pageSize,
            orderBy: { beginDate: "asc" },
            include: {
                medical: true
            }
        });

        const totalCount = await prisma.event.count({
            where: {
                clientId: clientId,
                beginDate: { gte: startDate, lte: endDate },
            },
        });

        return {events: events, numPages: Math.ceil(totalCount / pageSize), count: totalCount };

    } catch (error) {
        // istanbul ignore next
        throw error;
    }
}

export const updateClient = async (client: Client) => {
    try {
        return await prisma.client.update({where: {id: client.id}, data: client});

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