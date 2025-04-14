import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

beforeAll(async () => {
    if (process.env.NODE_ENV !== "test") {
        throw new Error("Tests should be run in a test environment.");
    }
    execSync("npx prisma migrate reset --force"); // Resets the test DB before tests
});

afterAll(async () => {
    await prisma.$disconnect();
});

// Make Prisma client available globally in tests
(global as any).prisma = prisma;
