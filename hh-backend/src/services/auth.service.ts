import { PrismaClient, Employee } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

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
        console.log(error);
        throw error;
    }

};
export const loginEmployee = async (data: { email: string; password: string }) => {
    // const user = await prisma.user.findUnique({ where: { email: data.email } });
    // if (!user || !(await bcrypt.compare(data.password, user.password))) {
    //     throw new Error("Invalid credentials");
    // }
    //
    // return jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: "1h" });
};
