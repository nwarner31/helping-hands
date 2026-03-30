import {TestEmployee} from "../../setuptestemployees";
import {employeeSetupTests, employeeTeardownTests} from "./employee.setuptest";
import request from "supertest";
import app from "../../../app";

describe("GET /employee/:employeeId", () => {
   let admin: TestEmployee;
   let associate: TestEmployee;
   let manager: TestEmployee;
   beforeAll(async () => {
       const employees = await employeeSetupTests();
       admin = employees.admin;
       associate = employees.associate;
       manager = employees.manager1;
   });
   afterAll(async () => {
       await employeeTeardownTests();
   });
   it("should return the employee data for a valid employee id for an admin", async () => {
       const res = await request(app).get(`/api/employee/${manager.id}`)
           .set("Authorization", `Bearer ${admin.token}`);
       expect(res.status).toBe(200);
       expect(res.body.message).toEqual("Employee found");
       expect(res.body.data).toBeDefined();
       expect(res.body.data.id).toEqual(manager.id);
   });
   it("should return 404 for an id that doesn't exist", async () => {
       const res = await request(app).get(`/api/employee/notanid`)
           .set("Authorization", `Bearer ${admin.token}`);
       expect(res.status).toBe(404);
   })
    it("should return 401 when no token is provided", async () => {
        const res = await request(app).get(`/api/employee/${manager.id}`);
        expect(res.status).toBe(401);
    });
    it("should return 403 for an associate", async () => {
        const res = await request(app).get(`/api/employee/${manager.id}`)
            .set("Authorization", `Bearer ${associate.token}`);
        expect(res.status).toBe(403);
    });
    it("should return 500 when the service throws", async () => {
        jest.spyOn(require("../../../services/auth.service"), "getEmployeeById")
            .mockResolvedValueOnce({id: "e1", position: "ADMIN"});
        jest.spyOn(require("../../../services/auth.service"), "getEmployeeById")
            .mockRejectedValue(new Error("Database connection failed"));
        const res = await request(app).get(`/api/employee/${manager.id}`)
            .set("Authorization", `Bearer ${admin.token}`);
        expect(res.status).toBe(500);
    })
});