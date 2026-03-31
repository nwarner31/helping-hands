import prisma from "../../../utility/prisma";
import { setupTestEmployees, teardownTestEmployees} from "../../setuptestemployees";
import {setupTestHouses, teardownTestHouses} from "../../setuptesthouses";
import {teardownTestClients} from "../../setuptestclients";


export const setupHouseTest = async () => {
    await prisma.house.deleteMany();
    await prisma.client.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.employee.deleteMany();
    await setupTestHouses()
    return await setupTestEmployees();
}

export const teardownHouseTests = async () => {
    const housePromise = await teardownTestHouses();
    const clientPromise = await teardownTestClients();;
    const employeePromise = await teardownTestEmployees();
    //await Promise.all([housePromise, clientPromise, employeePromise]);

}