import { config as loadEnv } from "dotenv";
import path from "path";

loadEnv({ path: path.resolve(__dirname, ".env.test") });
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

beforeAll(async () => {
    //dotenv.config({ path: path.resolve(__dirname, ".env.test") });
    if (process.env.NODE_ENV !== "test") {
        throw new Error("Tests should be run in a test environment.");
    }
    console.log("Using test DB:", process.env.DATABASE_URL);
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
});

afterAll(async () => {
    await prisma.$disconnect();
});

// Make Prisma client available globally in tests
(global as any).prisma = prisma;
