import prisma from "../utility/prisma";
import bcrypt from "bcryptjs";
import {generateToken} from "../utility/token.utility";

export type TestEmployee = {
    id: string;
    token: string;
};
export const setupTestEmployees = async () => {
    await prisma.employee.deleteMany();
    const adminId = "test123";
    const directorId = "test456";
    const associateId = "test789";

    const passwordHash = await bcrypt.hash("StrongPass123", 10);

    await prisma.employee.createMany({
        data: [
            {
                id: adminId,
                name: "John Admin",
                email: "admin@test.com",
                password: passwordHash,
                position: "ADMIN",
                hireDate: new Date("2024-03-09"),
                sex: "M",
            },
            {
                id: directorId,
                name: "Jane Director",
                email: "director@test.com",
                password: passwordHash,
                position: "DIRECTOR",
                hireDate: new Date("2024-03-09"),
                sex: "F",
            },
            {
                id: associateId,
                name: "John Associate",
                email: "associate@test.com",
                password: passwordHash,
                position: "ASSOCIATE",
                hireDate: new Date("2024-03-09"),
                sex: "M",
            },
        ],
        skipDuplicates: true,
    });
    console.log("Test employees created");

    return {
        admin: {
            id: adminId,
            token: generateToken(adminId).accessToken,},
        director: {
            id: directorId,
            token: generateToken(directorId).accessToken,},
        associate: {
            id: associateId,
            token: generateToken(associateId).accessToken,}
    };
};

export const teardownTestEmployees = async () => {
    await prisma.employee.deleteMany();
}