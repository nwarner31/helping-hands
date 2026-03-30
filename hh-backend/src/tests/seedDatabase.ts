import {setupTestEmployees, teardownTestEmployees} from "./setuptestemployees";
import {setupTestClients, teardownTestClients} from "./setuptestclients";
import {setupTestHouses, teardownTestHouses} from "./setuptesthouses";
import prisma from "../utility/prisma";
import {setupTestEvents, teardownTestEvents} from "./setuptestevents";
import {setupTestManagers} from "./setuptestmanagers";

export const seedDatabase = async () => {
    const tokens = await setupTestEmployees();
    await setupTestManagers();
    await setupTestClients();
    await setupTestEvents("c1", "c1", "c2");
    await setupTestHouses();
    return "Database seeded";
}

export const teardownDatabase = async () => {
    await teardownTestEvents()
    await teardownTestHouses();
    await teardownTestClients();
    await teardownTestEmployees();
    return "Database torn down";
}