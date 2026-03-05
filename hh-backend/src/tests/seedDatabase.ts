import {setupTestEmployees, teardownTestEmployees} from "./setuptestemployees";
import {setupTestClients, teardownTestClients} from "./setuptestclients";

export const seedDatabase = async () => {
    const tokens = await setupTestEmployees();
    await setupTestClients();
    return "Database seeded";
}

export const teardownDatabase = async () => {
    await teardownTestClients();
    await teardownTestEmployees();
    return "Database torn down";
}