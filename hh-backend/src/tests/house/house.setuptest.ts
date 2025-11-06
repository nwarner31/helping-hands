import prisma from "../../utility/prisma";
import { setupTestEmployees, teardownTestEmployees} from "../setuptestemployees";


export const setupHouseTest = async () => {
    await prisma.house.deleteMany();
    await prisma.client.deleteMany();
    await prisma.employee.deleteMany();
    return await setupTestEmployees();
}

export const teardownHouseTests = async () => {
    const housePromise = prisma.house.deleteMany();
    const clientPromise = prisma.client.deleteMany();
    const employeePromise = teardownTestEmployees();
    await Promise.all([housePromise, clientPromise, employeePromise]);
}