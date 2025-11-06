import prisma from "../utility/prisma";
import {Client} from "@prisma/client";

export type TestClient = {
    id: string;
}


export const setupTestClients = async () => {
    const clients: Client[] = [
        {
            id: "c1",
            legalName: "Client One",
            name: null,
            sex: "M",
            dateOfBirth: new Date("1990-01-01"),
            requiresStaff: false,
            houseId: null,
        },
        {
            id: "c2",
            legalName: "Client Two",
            name: null,
            sex: "F",
            dateOfBirth: new Date("1985-05-15"),
            requiresStaff: true,
            houseId: null,
        },
        {
            id: "c3",
            legalName: "Client Three",
            name: null,
            sex: "F",
            dateOfBirth: new Date("1999-10-27"),
            requiresStaff: true,
            houseId: null,
        },
    ]
    await prisma.client.deleteMany();
    await prisma.client.createMany({
        data: clients,
        skipDuplicates: true,
    });

    return {
        client1: clients[0],
        client2: clients[1],
        client3: clients[2],
    };
}

export const teardownTestClients = async () => {
    await prisma.client.deleteMany();
    await prisma.$disconnect();
}