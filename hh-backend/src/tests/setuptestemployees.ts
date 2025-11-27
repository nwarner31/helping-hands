import prisma from "../utility/prisma";
import bcrypt from "bcryptjs";
import {createTokens} from "../services/utility/token.service";

export type TestEmployee = {
    id: string;
    token: string;
};
export const setupTestEmployees = async () => {
    await prisma.session.deleteMany();
    await prisma.refreshToken.deleteMany();
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
    const [adminTokens, directorTokens, associateTokens] = await Promise.all([createTokens(adminId), createTokens(directorId), createTokens(associateId)]);
    return {
        admin: {
            id: adminId,
            token: adminTokens.sessionToken,},
        director: {
            id: directorId,
            token: directorTokens.sessionToken,},
        associate: {
            id: associateId,
            token: associateTokens.sessionToken,}
    };
};

export const clearTestEmployees = async () => {
    await prisma.employee.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.employee.deleteMany();
}

export const teardownTestEmployees = async () => {
    await prisma.session.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.employee.deleteMany();
}