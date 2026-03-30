import request from "supertest";
import app from "../../../app";
import { TestEmployee } from "../../setuptestemployees";
import {employeeSetupTests, employeeTeardownTests} from "./employee.setuptest";


describe("Employee Routes - GET /api/employee", () => {
    let admin: TestEmployee;
    let associate: TestEmployee;

    beforeAll(async () => {
        const employees = await employeeSetupTests();
        admin = employees.admin;
        associate = employees.associate;
    });

    afterAll(async () => {
        await employeeTeardownTests();
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
    it("should return 403 for an associate", async () => {
        const res = await request(app).get("/api/employee")
            .set("Authorization", `Bearer ${associate.token}`);
        expect(res.status).toBe(403);
    })

    it("should return 500 when service throws", async () => {
        jest.spyOn(require("../../../services/employee.service"), "getEmployees")
            .mockRejectedValue(new Error("Database connection failed"));

        const res = await request(app)
            .get("/api/employee")
            .set("Authorization", `Bearer ${admin.token}`);

        expect(res.status).toBe(500);
    });
});