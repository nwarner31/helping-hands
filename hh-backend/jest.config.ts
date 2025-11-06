import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFilesAfterEnv: ["./src/tests/setup.ts"],
};

process.env = Object.assign(process.env,
    { NODE_ENV: "test",
        DATABASE_URL: "postgresql://helpinghandstest:iamthetestuser@localhost:5432/helpinghandstest?schema=public" });

export default config;
