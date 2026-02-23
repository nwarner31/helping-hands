import prisma from "../../utility/prisma";


async function getClientEventsInRange(clientId: string, begin: Date, end?: Date) {
    return prisma.event.findMany({
        where: {
            clientId,
            beginDate: {
                gte: begin,
                ...(end ? { lte: end } : {}),
            },
        },
        orderBy: [
            { beginDate: "asc" },
            { beginTime: "asc" }
        ],
    });
}

function findConflicts(events: any[]) {
    const results: { event: any; conflicts: any[] }[] = [];

    for (let i = 0; i < events.length; i++) {
        const e1 = events[i];
        const conflicts = [];

        for (let j = i + 1; j < events.length; j++) {
            const e2 = events[j];

            // If e2 starts after e1 ends → no more conflicts possible
            if (e2.beginDateTime >= e1.endDateTime) break;

            // Check overlap
            // const overlap =
            //     e1.beginDateTime < e2.endDateTime &&
            //     e2.beginDateTime < e1.endDateTime;
            const overlap = e1.endDate.toDateString() === e2.beginDate.toDateString() && e1.endTime.getTime() > e2.beginTime.getTime();
             console.log(e1.endDate);
            console.log(e2.beginDate);
            if (overlap) conflicts.push(e2);
        }

        if (conflicts.length > 0) {
            results.push({ event: e1, conflicts });
        }
    }
    return results;
}

export const checkClientEventConflicts = async (clientId: string, beginDate?: Date, endDate?: Date) => {
    const events = await getClientEventsInRange(clientId, beginDate || new Date(), endDate);
    const conflicts = findConflicts(events);
    return { hasConflicts: conflicts.length > 0, numConflicts: conflicts.length };
}

export const getClientEventConflicts = async (clientId: string, beginDate?: Date, endDate?: Date) => {
    const events = await getClientEventsInRange(clientId, beginDate || new Date(), endDate);
    return findConflicts(events);
}
