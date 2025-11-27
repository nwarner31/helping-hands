import prisma from "../utility/prisma";
import bcrypt from "bcryptjs";
import {generateToken} from "../utility/token.utility";

export type TestEmployee = {
    id: string;
    token: string;
};
export const setupTestManagers = async () => {
    const manager1Id = "m123";
    const manager2Id = "m456";
    const manager3Id = "m789";

    const passwordHash = await bcrypt.hash("StrongPass123", 10);

    await prisma.employee.createMany({
        data: [
            {
                id: manager1Id,
                name: "Bob Manager",
                email: "bob@manager.com",
                password: passwordHash,
                position: "MANAGER",
                hireDate: new Date("2024-03-09"),
                sex: "M",
            },
            {
                id: manager2Id,
                name: "Sarah Manager",
                email: "sarah@manager.com",
                password: passwordHash,
                position: "MANAGER",
                hireDate: new Date("2024-03-09"),
                sex: "F",
            },
            {
                id: manager3Id,
                name: "Tom Manager",
                email: "tom@manager.com",
                password: passwordHash,
                position: "MANAGER",
                hireDate: new Date("2024-03-09"),
                sex: "M",
            },
        ],
        skipDuplicates: true,
    });

    return {
        manager1: {
            id: manager1Id,
            token: generateToken(manager1Id).sessionToken,},
        manager2: {
            id: manager2Id,
            token: generateToken(manager2Id).sessionToken,},
        manager3: {
            id: manager3Id,
            token: generateToken(manager3Id).sessionToken,}
    };
};

export const teardownTestManagers = async () => {
    await prisma.employee.deleteMany();
}