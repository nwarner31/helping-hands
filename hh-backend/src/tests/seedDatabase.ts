import {setupTestEmployees, teardownTestEmployees} from "./setuptestemployees";


export const seedDatabase = async () => {
    const tokens = await setupTestEmployees();
    return "Database seeded";
}

export const teardownDatabase = async () => {
    await teardownTestEmployees();
    return "Database torn down";
}