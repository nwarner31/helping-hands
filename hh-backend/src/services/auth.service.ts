import {Employee, Prisma} from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "../utility/prisma";
import {HttpError} from "../utility/httperror";
import {capitalizeFirst} from "../utility/stringFormat.utility";


export const registerEmployee = async (employee: Employee ) => {
    try {
        const hashedPassword = await bcrypt.hash(employee.password, 10);
        employee.password = hashedPassword
        const newEmployee = await prisma.employee.create({
            data: { ...employee }
        });
        return newEmployee;
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            // Prisma gives you which fields caused the unique constraint error
            const fields = (error.meta?.target as string[]) || [];
            throw new HttpError(400, "duplicate", Object.fromEntries(fields.map(f => [f, `${capitalizeFirst(f)} already exists`])));
        }
        throw error;
    }

};
export const loginEmployee = async (data: { email: string; password: string }) => {
    try {
        const employee = await prisma.employee.findUnique({ where: { email: data.email } });
        if (!employee || !(await bcrypt.compare(data.password, employee.password))) {
            throw new Error("Invalid credentials");
        }
        return employee;
    }
    catch (error) {
        throw error;
    }
};

export const getEmployeeById = async (employeeId: string) => {
    try {
        const employee = await prisma.employee.findUnique({where: {id: employeeId}});
        if(!employee){
            throw new Error("Employee not found");
        }
        return employee;
    } catch(error) {
        // istanbul ignore next
        throw error;
    }
}
