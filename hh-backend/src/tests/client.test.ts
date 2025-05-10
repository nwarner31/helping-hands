import request from "supertest";
import app from "../app"; // Ensure this is your Express app instance
import {afterAll, beforeAll} from "@jest/globals";
import {execSync} from "child_process";
import jwt from 'jsonwebtoken';
import { seedEmployees } from "./utils/testEmployees";
import prisma from "../utility/prisma";
import {loginEmployee} from "../services/auth.service";

// jest.mock("../services/auth", () => ({
//     prisma: {employee: {findUnique: jest.fn()}}
// }));

// jest.mock('../utility/prisma', () => ({
//     __esModule: true,
//     default: {
//         employee: {
//             findUnique: jest.fn(),
//         },
//     }
// }));
beforeAll(async () => {
    //seedEmployees();
    await prisma.employee.deleteMany();
    await prisma.client.deleteMany();
    const response = await request(app)
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
    await request(app)
        .post("/api/auth/register")
        .send({
            employeeId: "test456",
            name: "John Doe",
            email: "john@test.com",
            password: "StrongPass123",
            confirmPassword: "StrongPass123",
            hireDate: "2024-03-09",
        });
})
afterAll(async () => {
    await prisma.employee.deleteMany();
    await prisma.client.deleteMany();
    await prisma.$disconnect();
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe("Client Routes - Add Client",  () => {
    const validClient = {clientId: "T12345", legalName: "Test Client", dateOfBirth: "2000-04-12", sex: "M"}
    afterEach(async () => {
        await prisma.client.deleteMany();
    })
    it("should successfully add a client with correct data and admin", async () => {
        const login = {email: "admin@test.com", password: "StrongPass123"};
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send(login);
        const token = loginResponse.body.accessToken;
            const response = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${token}`)
            .send(validClient);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("client");
        expect(response.body.message).toBe("Client added");
    });
    it("should come back with a 401 if no token provided", async () => {
        const response = await request(app).post("/api/client")
            .send({clientId: "T12345", legalName: "Test Client", dateOfBirth: "2000-04-12"});
        expect(response.status).toBe(401);
    });
    it("should come back with a 403 if not an admin", async () => {
        const login = {email: "john@test.com", password: "StrongPass123"};
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send(login);
        const token = loginResponse.body.accessToken;
        const response = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${token}`)
            .send(validClient);
        expect(response.status).toBe(403);
    });

    const requiredFields = ["clientId", "legalName", "dateOfBirth"];

    requiredFields.forEach((field) => {
        it(`should return 400 when '${field}' is missing`, async () => {
            const invalidData = { ...validClient };
            delete invalidData[field as keyof typeof validClient];  // Remove the field

            const login = {email: "admin@test.com", password: "StrongPass123"};
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send(login);
            const token = loginResponse.body.accessToken;

            const response = await request(app).post("/api/client")
                .set("Authorization", `Bearer ${token}`)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
            expect(response.body.message).toHaveProperty(field);
        });
    });
    it("should return 400 for bad date of birth", async () => {
        const login = {email: "admin@test.com", password: "StrongPass123"};
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send(login);
        const token = loginResponse.body.accessToken;
        const invalidDateClient = { ... validClient, dateOfBirth: "bad-dateOfBirth"}
        const response = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${token}`)
            .send(invalidDateClient);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toHaveProperty("dateOfBirth");
    });
    it("should return an error for duplicate client id", async () => {
        const login = {email: "admin@test.com", password: "StrongPass123"};
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send(login);
        const token = loginResponse.body.accessToken;
        const response = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${token}`)
            .send(validClient);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("client");
        expect(response.body.message).toBe("Client added");
        const badResponse = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${token}`)
            .send(validClient);
        expect(badResponse.statusCode).toBe(400);
        expect(badResponse.body.message).toBe("invalid data");
        expect(badResponse.body.errors).toHaveProperty("clientId");
    })
});

describe("Client Routes - Get All Clients", () => {
    let token: string | null = null;
    beforeAll(async () => {
        const login = {email: "admin@test.com", password: "StrongPass123"};
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send(login);
        token = loginResponse.body.accessToken;
        const client1Response = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${token}`)
            .send({clientId: "T12345", legalName: "Test Client", dateOfBirth: "2000-04-12"});
        const client2Response = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${token}`)
            .send({clientId: "C234567", legalName: "Second Client", dateOfBirth: "2000-04-12"});
    });
    it("should return all clients with a valid token", async () => {
        const response = await request(app).get("/api/client")
            .set("Authorization", `Bearer ${token}`)
        expect(response.body.message).toBe("clients successfully retrieved");
        expect(response.body.clients).toHaveLength(2);
    });
    it("should return 401 with no token", async () => {
        const response = await request(app).get("/api/client")
        expect(response.statusCode).toBe(401);
    });
});

describe("Client Routes - Update Client", () => {
    let token: string | null = null;
    const client = {clientId: "T12345", legalName: "Test Client", dateOfBirth: "2000-04-12"};
    beforeAll(async () => {
        const login = {email: "admin@test.com", password: "StrongPass123"};
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send(login);
        token = loginResponse.body.accessToken;
        const clientResponse = await request(app).post("/api/client")
            .set("Authorization", `Bearer ${token}`)
            .send(client);
    });
    it("should update the client with the correct data and token", async () => {
        const updatedClient = {...client, legalName: "Updated Client"};
        const response = await request(app)
            .put(`/api/client/${client.clientId}`)
            .set("Authorization", `Bearer ${token}`)
            .send(updatedClient);
        expect(response.status).toBe(200);
        expect(response.body.client.legalName).toBe("Updated Client");
    });
    it("should return 401 for no token", async () => {
        const updatedClient = {...client, legalName: "Updated Client"};
        const response = await request(app)
            .put(`/api/client/${client.clientId}`)
            .send(updatedClient);
        expect(response.status).toBe(401);
    });
    it("should come back with a 403 if not an admin", async () => {
        const login = {email: "john@test.com", password: "StrongPass123"};
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send(login);
        const token = loginResponse.body.accessToken;
        const updatedClient = {...client, legalName: "Updated Client"};
        const response = await request(app)
            .put(`/api/client/${client.clientId}`)
            .set("Authorization", `Bearer ${token}`)
            .send(updatedClient);
        expect(response.status).toBe(403);
    });
    const requiredFields = ["clientId", "legalName", "dateOfBirth"];

    requiredFields.forEach((field) => {
        it(`should return 400 when '${field}' is missing`, async () => {
            const invalidData = {...client};
            delete invalidData[field as keyof typeof client];  // Remove the field
            const response = await request(app).put(`/api/client/${client.clientId}`)
                .set("Authorization", `Bearer ${token}`)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
            expect(response.body.message).toHaveProperty(field);
        });
    });
});

describe("Client Routes - Get no house", () => {
    let token: string;
    beforeAll(async () => {
        const login = await request(app).post("/api/auth/login").send({
            email: "admin@test.com",
            password: "StrongPass123"});
        token = login.body.accessToken;
        await prisma.client.deleteMany();
        await prisma.house.deleteMany();
        await request(app).post("/api/client")
            .set("Authorization", `Bearer ${token}`)
            .send({clientId: "C4001",
                legalName: "Unhoused Client",
                dateOfBirth: new Date("1985-06-06"),
                sex: "M"});
        await request(app).post("/api/house")
            .set("Authorization", `Bearer ${token}`)
            .send( {
                houseId: "H3001",
                name: "Safe Haven",
                street1: "3 Shelter St",
                city: "Refuge",
                state: "TX",
                maxClients: 3,
                femaleEmployeeOnly: false,
            });
        await request(app).post("/api/client")
            .set("Authorization", `Bearer ${token}`)
            .send({clientId: "C4002",
                    legalName: "Housed Client",
                    dateOfBirth: new Date("1991-04-10"),
                sex: "M"});
        await request(app).patch("/api/house/H3001/clients")
            .set("Authorization", `Bearer ${token}`)
            .send({clientId: "C4002"});
    });
    it("should return a list of clients without a house", async () => {
        const res = await request(app)
            .get("/api/client/no-house")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("clients found");
        expect(Array.isArray(res.body.clients)).toBe(true);
        expect(res.body.clients.length).toBe(1);
        expect(res.body.clients[0].clientId).toBe("C4001");
    });
    it("should return 401 if not authenticated", async () => {
        const res = await request(app).get("/api/house/no-house");
        expect(res.status).toBe(401);
    });
    it("should return 403 if user does not have ADMIN or DIRECTOR role", async () => {
       const associate = await request(app).post("/api/auth/login")
           .send({email: "john@test.com",
               password: "StrongPass123"})
           const associateToken = associate.body.accessToken;

        const res = await request(app)
            .get("/api/client/no-house")
            .set("Authorization", `Bearer ${associateToken}`);

        expect(res.status).toBe(403);
    });
})