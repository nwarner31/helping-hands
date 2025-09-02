import prisma from "../../utility/prisma";
import request from "supertest";
import app from "../../app";


export const clientSetupTests = async () => {
    await prisma.employee.deleteMany();
    await prisma.client.deleteMany();
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
    const associatePromise = request(app)
        .post("/api/auth/register")
        .send({
            id: "test456",
            name: "John Doe",
            email: "john@test.com",
            password: "StrongPass123",
            confirmPassword: "StrongPass123",
            hireDate: "2024-03-09",
            sex: "M"
        });
    const [adminResponse, associateResponse] = await Promise.all([adminPromise, associatePromise]);
    return {
        adminToken: adminResponse.body.accessToken,
        associateToken: associateResponse.body.accessToken};
}

export const clientTeardownTests = async () => {
    await Promise.all([prisma.employee.deleteMany(), prisma.client.deleteMany()]);
    await prisma.$disconnect();
}