import prisma from "../../utility/prisma";
import request from "supertest";
import app from "../../app";


export const setupHouseTest = async () => {
    await prisma.house.deleteMany();
    await prisma.client.deleteMany();
    await prisma.employee.deleteMany();
    const adminPromise = request(app)
        .post("/api/auth/register")
        .send({
            id: "test123",
            name: "John Doe",
            email: "admin@test.com",
            password: "StrongPass123",
            confirmPassword: "StrongPass123",
            position: "ADMIN",
            hireDate: "2024-03-09",
            sex: "M"
        });
    const directorPromise = request(app)
        .post("/api/auth/register")
        .send({
            id: "test456",
            name: "John Doe",
            email: "director@test.com",
            password: "StrongPass123",
            confirmPassword: "StrongPass123",
            position: "DIRECTOR",
            hireDate: "2024-03-09",
            sex: "M"
        });
    const associatePromise = request(app)
        .post("/api/auth/register")
        .send({
            id: "test789",
            name: "John Doe",
            email: "john@test.com",
            password: "StrongPass123",
            confirmPassword: "StrongPass123",
            hireDate: "2024-03-09",
            sex: "M"
        });
    const [adminResponse, directorResponse, associateResponse] = await Promise.all([adminPromise, directorPromise, associatePromise]);
    return {
        adminToken: adminResponse.body.accessToken,
        directorToken: directorResponse.body.accessToken,
        associateToken: associateResponse.body.accessToken
    }
}

export const teardownHouseTests = async () => {
    const housePromise = prisma.house.deleteMany();
    const clientPromise = prisma.client.deleteMany();
    const employeePromise = prisma.employee.deleteMany();
    await Promise.all([housePromise, clientPromise, employeePromise]);
}