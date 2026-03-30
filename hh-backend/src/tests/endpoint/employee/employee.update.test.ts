import {employeeSetupTests, employeeTeardownTests} from "./employee.setuptest";
import {TestEmployee} from "../../setuptestemployees";
import request from "supertest";
import app from "../../../app";


describe("Employee Routes - PUT /api/employee/:employeeId", () => {
    const sampleEmployeeData = {
        name: "Updated Name",
        email: "updated@mail.com",
        hireDate: "2025-01-01",
        sex: "M",
        position: "ASSOCIATE"
    };
    let admin: TestEmployee;
    let associate: TestEmployee;
    let manager: TestEmployee;
    beforeEach(async () => {
        const employees = await employeeSetupTests();
        admin = employees.admin;
        associate = employees.associate;
        manager = employees.manager1;
    });
    afterEach(async () => {
        await employeeTeardownTests();
    });
    it("should update an employee", async () => {
        const response = await request(app)
            .put(`/api/employee/${manager.id}`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send(sampleEmployeeData);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Employee successfully updated");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data.name).toBe(sampleEmployeeData.name);
        expect(response.body.data.email).toBe(sampleEmployeeData.email);
        expect(response.body.data.hireDate).toBe(`${sampleEmployeeData.hireDate}T00:00:00.000Z`);
        expect(response.body.data.position).toBe(sampleEmployeeData.position);
    })
    it("should return 404 for an id that doesn't exist", async () => {
        const res = await request(app)
            .put(`/api/employee/notanid`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send(sampleEmployeeData);
        expect(res.status).toBe(404);
    });
    const requiredFields = ["name", "email", "hireDate", "sex", "position"];
    requiredFields.forEach((field) => {
        it(`should return 400 when '${field}' is missing`, async () => {
           const invalidEmployee = {...sampleEmployeeData};
            delete invalidEmployee[field as keyof typeof sampleEmployeeData];
            const response = await request(app)                .put(`/api/employee/${manager.id}`)
                .set("Authorization", `Bearer ${admin.token}`)
                .send(invalidEmployee);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
            expect(response.body.errors).toHaveProperty(field);
        });
    });
    it("should return 400 for an improperly formatted email", async () => {
        const invalidEmployee = {...sampleEmployeeData, email: "thisisntanemail"};
        const response = await request(app)
            .put(`/api/employee/${manager.id}`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send(invalidEmployee);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.errors).toHaveProperty("email");
    });
    it("should return 400 for an improperly formatted hire date", async () => {
        const invalidEmployee = {...sampleEmployeeData, hireDate: "notavaliddate"};
        const response = await request(app)
            .put(`/api/employee/${manager.id}`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send(invalidEmployee);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.errors).toHaveProperty("hireDate");
    });
    it("should return 400 for an improper position", async () => {
        const invalidEmployee = {...sampleEmployeeData, position: "NOTAPOSITION"};
        const response = await request(app)
            .put(`/api/employee/${manager.id}`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send(invalidEmployee);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.errors).toHaveProperty("position");
    });
    it("should return 400 for an improper sex", async () => {
        const invalidEmployee = {...sampleEmployeeData, sex: "NOTASEX"};
        const response = await request(app)
            .put(`/api/employee/${manager.id}`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send(invalidEmployee);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.errors).toHaveProperty("sex");
    });
    it("should return 500 for a duplicate email", async () => {
        const invalidEmployee = {...sampleEmployeeData, email: associate.email};
        const response = await request(app)
            .put(`/api/employee/${manager.id}`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send(invalidEmployee);
        expect(response.status).toBe(500);
    });

    it("should return 401 for no token", async () => {
        const res = await request(app)
            .put(`/api/employee/${manager.id}`)
            .send(sampleEmployeeData);
        expect(res.status).toBe(401);
    })
    it("should return 403 for an associate", async () => {
        const res = await request(app)
            .put(`/api/employee/${manager.id}`)
            .set("Authorization", `Bearer ${associate.token}`)
            .send(sampleEmployeeData);
        expect(res.status).toBe(403);
    });

})