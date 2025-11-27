import prisma from "../../../utility/prisma"
import { cleanupOldTokens } from "../../../services/utility/token.service";
import { add } from "date-fns";

describe("cleanupOldTokens()", () => {

    beforeAll(async () => {
        await prisma.refreshToken.deleteMany();
        await prisma.session.deleteMany();
        await prisma.employee.deleteMany();
        await prisma.employee.create({
            data: {
                id: "emp1",
                name: "Test Employee",
                email: "test@employee.com",
                position: "ASSOCIATE",
                password: "TestPass123",
                hireDate: new Date(),
                sex: "M",
            },
        });
    });

    afterEach(async () => {
        await prisma.refreshToken.deleteMany();
        await prisma.session.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("deletes refresh tokens expired > 7 days", async () => {
        const oldDate = add(new Date(), { days: -8 });

        await prisma.refreshToken.create({
            data: {
                token: "expiredRefresh",
                employeeId: "emp1",
                expiresAt: oldDate,
                revoked: false,
            },
        });

        await prisma.refreshToken.create({
            data: {
                token: "recentRefresh",
                employeeId: "emp1",
                expiresAt: add(new Date(), { days: 1 }),
                revoked: false,
            },
        });

        await cleanupOldTokens();

        const tokens = await prisma.refreshToken.findMany();
        expect(tokens.length).toBe(1);
        expect(tokens[0].token).toBe("recentRefresh");
    });

    it("deletes refresh tokens revoked > 7 days", async () => {
        const oldRevoked = add(new Date(), { days: -8 });

        await prisma.refreshToken.create({
            data: {
                token: "revokedRefresh",
                employeeId: "emp1",
                revoked: true,
                revokedAt: oldRevoked,
                expiresAt: add(new Date(), { days: 2 }),
            },
        });

        await prisma.refreshToken.create({
            data: {
                token: "validRefresh",
                employeeId: "emp1",
                revoked: false,
                expiresAt: add(new Date(), { days: 5 }),
            },
        });

        await cleanupOldTokens();

        const tokens = await prisma.refreshToken.findMany();
        expect(tokens.length).toBe(1);
        expect(tokens[0].token).toBe("validRefresh");
    });

    it("deletes sessions expired > 24 hours", async () => {
        const oldDate = add(new Date(), { hours: -30 });

        await prisma.session.create({
            data: {
                token: "expiredSession",
                employeeId: "emp1",
                isValid: true,
                expiresAt: oldDate,
            },
        });

        await prisma.session.create({
            data: {
                token: "validSession",
                employeeId: "emp1",
                isValid: true,
                expiresAt: add(new Date(), { hours: 5 }),
            },
        });

        await cleanupOldTokens();

        const sessions = await prisma.session.findMany();
        expect(sessions.length).toBe(1);
        expect(sessions[0].token).toBe("validSession");
    });

    it("deletes invalid sessions > 24 hours old", async () => {
        const oldDate = add(new Date(), { hours: -30 });

        await prisma.session.create({
            data: {
                token: "invalidOldSession",
                employeeId: "emp1",
                isValid: false,
                updatedAt: oldDate,
                expiresAt: add(new Date(), { hours: 5 }),
            },
        });

        await prisma.session.create({
            data: {
                token: "recentInvalidSession",
                employeeId: "emp1",
                isValid: false,
                updatedAt: new Date(),
                expiresAt: add(new Date(), { hours: 5 }),
            },
        });

        await cleanupOldTokens();

        const sessions = await prisma.session.findMany();
        expect(sessions.length).toBe(1);
        expect(sessions[0].token).toBe("recentInvalidSession");
    });
});
