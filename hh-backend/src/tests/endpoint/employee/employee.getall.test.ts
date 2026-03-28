import request from "supertest";
import app from "../../../app";
import {setupTestEmployees, teardownTestEmployees, TestEmployee} from "../../setuptestemployees";


describe("Employee Routes - GET /api/employee", () => {
    let admin: TestEmployee;

    beforeAll(async () => {
        const employees = await setupTestEmployees();
        admin = employees.admin;
    });

    afterAll(async () => {
        await teardownTestEmployees();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should return all employees with a valid token", async () => {
        const res = await request(app)
            .get("/api/employee")
            .set("Authorization", `Bearer ${admin.token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("message", "Employees found");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should return 401 when no token is provided", async () => {
        const res = await request(app).get("/api/employee");
        expect(res.status).toBe(401);
    });

    it("should return 500 when service throws", async () => {
        jest.spyOn(require("../../../services/employee.service"), "getEmployees")
            .mockRejectedValue(new Error("Database connection failed"));

        const res = await request(app)
            .get("/api/employee")
            .set("Authorization", `Bearer ${admin.token}`);

        expect(res.status).toBe(500);
    });
});