import prisma from "../../utility/prisma";
import { EmployeePosition } from "@prisma/client";

export async function seedEmployees() {
    return prisma.employee.createMany({
        data: [
            {
                id: "emp001",
                name: "Alice Smith",
                email: "alice@example.com",
                password: "hashedpassword1", // Normally this would be hashed
                position: EmployeePosition.ADMIN,
                hireDate: new Date("2020-01-01"),
                sex: "F",
            },
            {
                id: "emp002",
                name: "Bob Johnson",
                email: "bob@example.com",
                password: "hashedpassword2",
                position: EmployeePosition.ASSOCIATE,
                hireDate: new Date("2021-01-01"),
                sex: "M",
            },
        ],
        skipDuplicates: true, // optional
    });
}
