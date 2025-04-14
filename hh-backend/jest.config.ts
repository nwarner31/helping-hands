import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFilesAfterEnv: ["./src/tests/setup.ts"],
};

process.env.ACCESS_TOKEN_SECRET = "testsecret";
process.env.REFRESH_TOKEN_SECRET = "anothertestsecret";
process.env.DATABASE_URL="postgresql://helping_hands:helpinghandsdb@localhost:5432/helping_hands_test?schema=public"

export default config;
