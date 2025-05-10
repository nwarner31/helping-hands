import prisma from "../../utility/prisma";
import request from "supertest";
import app from "../../app";


export const clientSetupTests = async () => {
    await prisma.employee.deleteMany();
    await prisma.client.deleteMany();
    const adminPromise = request(app)
        .post("/api/auth/register")
        .send({
            employeeId: "test123",
            name: "John Doe",
            email: "admin@test.com",
            password: "StrongPass123",
            confirmPassword: "StrongPass123",
            position: "ADMIN",
            hireDate: "2024-03-09",
        });
    const associatePromise = request(app)
        .post("/api/auth/register")
        .send({
            employeeId: "test456",
            name: "John Doe",
            email: "john@test.com",
            password: "StrongPass123",
            confirmPassword: "StrongPass123",
            hireDate: "2024-03-09",
        });
    const [adminResponse, associateResponse] = await Promise.all([adminPromise, associatePromise]);
    return {
        adminToken: adminResponse.body.accessToken,
        associateToken: associateResponse.body.associateToken};
}

export const clientTeardownTests = async () => {
    await Promise.all([prisma.employee.deleteMany(), prisma.client.deleteMany()]);
    await prisma.$disconnect();
}