import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "../../../utility/prisma";
import { HttpError } from "../../../utility/httperror";
import { getEmployeeById, loginEmployee, registerEmployee } from "../../../services/auth.service";

jest.mock("../../../utility/prisma", () => ({
    __esModule: true,
    default: {
        employee: {
            create: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}));

jest.mock("bcryptjs", () => ({
    __esModule: true,
    default: {
        hash: jest.fn(),
        compare: jest.fn(),
    },
}));

const makeEmployee = (overrides: Partial<any> = {}) => ({
    id: "emp-1",
    name: "Test Employee",
    email: "test@example.com",
    position: "ASSOCIATE",
    password: "plaintext-pass",
    hireDate: new Date("2024-01-01T00:00:00.000Z"),
    sex: "M",
    ...overrides,
});

const makeP2002Error = (fields: string[]) => {
    const err = Object.create(Prisma.PrismaClientKnownRequestError.prototype) as Prisma.PrismaClientKnownRequestError & {
        code: string;
        meta: { target: string[] };
    };
    err.code = "P2002";
    err.meta = { target: fields };
    return err;
};

describe("registerEmployee()", () => {
    const mockedHash = bcrypt.hash as unknown as jest.Mock;
    const mockedCreate = prisma.employee.create as unknown as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("hashes password and creates employee", async () => {
        const employee = makeEmployee();
        mockedHash.mockResolvedValue("hashed-pass");
        mockedCreate.mockResolvedValue({ ...employee, password: "hashed-pass" });

        await expect(registerEmployee(employee as any)).resolves.toMatchObject({
            id: "emp-1",
            email: "test@example.com",
            password: "hashed-pass",
        });

        expect(mockedHash).toHaveBeenCalledWith("plaintext-pass", 10);
        expect(mockedCreate).toHaveBeenCalledWith({ data: expect.objectContaining({ password: "hashed-pass" }) });
        expect(employee.password).toBe("hashed-pass");
    });

    it("maps Prisma P2002 to HttpError with duplicate field messages", async () => {
        const employee = makeEmployee();
        mockedHash.mockResolvedValue("hashed-pass");
        mockedCreate.mockRejectedValue(makeP2002Error(["email", "id"]));

        await expect(registerEmployee(employee as any)).rejects.toMatchObject<HttpError>({
            name: "HttpError",
            status: 400,
            message: "duplicate",
            errors: {
                email: "Email already exists",
                id: "Id already exists",
            },
        });
    });

    it("handles P2002 when meta.target is missing", async () => {
        const employee = makeEmployee();
        mockedHash.mockResolvedValue("hashed-pass");

        const err = Object.create(Prisma.PrismaClientKnownRequestError.prototype) as any;
        err.code = "P2002";
        err.meta = undefined; // forces optional-chain false path
        mockedCreate.mockRejectedValue(err);

        await expect(registerEmployee(employee as any)).rejects.toMatchObject({
            name: "HttpError",
            status: 400,
            message: "duplicate",
            errors: {}, // because fields fallback to []
        });
    });

    it("rethrows non-P2002 errors", async () => {
        const employee = makeEmployee();
        const dbError = new Error("db unavailable");
        mockedHash.mockResolvedValue("hashed-pass");
        mockedCreate.mockRejectedValue(dbError);

        await expect(registerEmployee(employee as any)).rejects.toBe(dbError);
    });
});

describe("loginEmployee()", () => {
    const mockedCompare = bcrypt.compare as unknown as jest.Mock;
    const mockedFindUnique = prisma.employee.findUnique as unknown as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns employee when email exists and password matches", async () => {
        const employee = makeEmployee({ password: "hashed-pass" });
        mockedFindUnique.mockResolvedValue(employee);
        mockedCompare.mockResolvedValue(true);

        await expect(loginEmployee({ email: employee.email, password: "plaintext-pass" })).resolves.toEqual(employee);

        expect(mockedFindUnique).toHaveBeenCalledWith({ where: { email: employee.email } });
        expect(mockedCompare).toHaveBeenCalledWith("plaintext-pass", "hashed-pass");
    });

    it("throws Invalid credentials when employee does not exist", async () => {
        mockedFindUnique.mockResolvedValue(null);

        await expect(loginEmployee({ email: "missing@example.com", password: "pw" })).rejects.toThrow("Invalid credentials");
        expect(mockedCompare).not.toHaveBeenCalled();
    });

    it("throws Invalid credentials when password does not match", async () => {
        const employee = makeEmployee({ password: "hashed-pass" });
        mockedFindUnique.mockResolvedValue(employee);
        mockedCompare.mockResolvedValue(false);

        await expect(loginEmployee({ email: employee.email, password: "wrong-pass" })).rejects.toThrow("Invalid credentials");
        expect(mockedCompare).toHaveBeenCalledWith("wrong-pass", "hashed-pass");
    });

    it("rethrows prisma failures", async () => {
        const dbError = new Error("find failed");
        mockedFindUnique.mockRejectedValue(dbError);

        await expect(loginEmployee({ email: "x@example.com", password: "pw" })).rejects.toBe(dbError);
    });
});

describe("getEmployeeById()", () => {
    const mockedFindUnique = prisma.employee.findUnique as unknown as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns employee when found", async () => {
        const employee = makeEmployee();
        mockedFindUnique.mockResolvedValue(employee);

        await expect(getEmployeeById("emp-1")).resolves.toEqual(employee);
        expect(mockedFindUnique).toHaveBeenCalledWith({ where: { id: "emp-1" } });
    });

    it("throws Employee not found when employee is missing", async () => {
        mockedFindUnique.mockResolvedValue(null);

        await expect(getEmployeeById("missing-id")).rejects.toThrow("Employee not found");
    });

    it("rethrows prisma failures", async () => {
        const dbError = new Error("lookup failed");
        mockedFindUnique.mockRejectedValue(dbError);

        await expect(getEmployeeById("emp-1")).rejects.toBe(dbError);
    });
});

