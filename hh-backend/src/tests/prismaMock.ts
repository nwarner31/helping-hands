import { PrismaClient } from "@prisma/client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

jest.mock("@prisma/client", () => ({
    PrismaClient: jest.fn(() => mockDeep<PrismaClient>()),
}));

const prismaMock = new PrismaClient() as DeepMockProxy<PrismaClient>;

export { prismaMock };
