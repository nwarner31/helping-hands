import prisma from "../utility/prisma";



export const getEmployees = async () => {
    try {
        return await prisma.employee.findMany({
            select: {
                id: true, email: true, sex: true, hireDate: true, name: true, position: true
            }
        });
    } catch (error) {
        // istanbul ignore next
        throw error;
    }
}


export const putEmployee = async (employeeId: string, employeeData: any) => {
    try {
        return await prisma.employee.update({
            where: {id: employeeId},
            data: employeeData,
            select: {
                id: true, email: true, sex: true, hireDate: true, name: true, position: true
            }
        });
    } catch (error) {
        // istanbul ignore next
        throw error;
    }
}