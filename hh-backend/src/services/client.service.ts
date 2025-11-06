import { Client} from "@prisma/client";
import prisma from "../utility/prisma";

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

export const getClientByClientId = async (clientId: string) => {
    try {
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