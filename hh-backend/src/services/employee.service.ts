import prisma from "../utility/prisma";



export const getEmployees = async () => {
    try {
        return await prisma.employee.findMany();
    } catch (error) {
        // istanbul ignore next
        throw error;
    }
}

