import prisma from "../../utility/prisma";
import { setupTestEmployees, teardownTestEmployees } from "../setuptestemployees";


export const clientSetupTests = async () => {
    await prisma.client.deleteMany();
    return await setupTestEmployees();
}

export const clientTeardownTests = async () => {
    await Promise.all([teardownTestEmployees(), prisma.client.deleteMany()]);
    await prisma.$disconnect();
}