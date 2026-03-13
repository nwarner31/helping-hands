import {setupTestEmployees, teardownTestEmployees} from "./setuptestemployees";
import {setupTestClients, teardownTestClients} from "./setuptestclients";
import {setupTestHouses, teardownTestHouses} from "./setuptesthouses";
import prisma from "../utility/prisma";

export const seedDatabase = async () => {
    const tokens = await setupTestEmployees();
    await setupTestClients();
    await setupTestHouses();
    return "Database seeded";
}

export const teardownDatabase = async () => {
    await prisma.medicalEvent.deleteMany();
    await prisma.event.deleteMany();
    await teardownTestHouses();
    await teardownTestClients();
    await teardownTestEmployees();
    return "Database torn down";
}