import prisma from "../../../utility/prisma";
import {setupTestEmployees} from "../../setuptestemployees";
import {setupTestManagers} from "../../setuptestmanagers";


export const employeeSetupTests = async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.employee.deleteMany();
    const employees = await setupTestEmployees();
    const managers = await setupTestManagers();
    return {...employees ,...managers};
}

export const employeeTeardownTests = async () => {
    await Promise.all([
        prisma.refreshToken.deleteMany(),
        prisma.session.deleteMany(),
    ]);
    await prisma.employee.deleteMany();
    await prisma.$disconnect();
}