import prisma from "../utility/prisma";
import {House} from "@prisma/client";

export const setupTestHouses = async () => {
    await prisma.house.deleteMany();
    const houses: House[] = [
        {
            id: "H1",
            name: "Test House 1",
            street1: "100 S Test Ave",
            street2: null,
            city: "Testtopia",
            state: "TH",
            maxClients: 2,
            femaleEmployeeOnly: false,
            primaryManagerId: null,
            secondaryManagerId: null
        },
        {
            id: "H2",
            name: "Test House 2",
            street1: "200 S Test Ave",
            street2: null,
            city: "Testtopia",
            state: "TH",
            maxClients: 3,
            femaleEmployeeOnly: false,
            primaryManagerId: null,
            secondaryManagerId: null
        }
    ];

    await prisma.house.createMany({
        data: houses,
        skipDuplicates: true
    });

    return {
        house1: houses[0],
        house2: houses[1]
    }
}

export const teardownTestHouses= async () => {
    await prisma.house.deleteMany();
    await prisma.$disconnect();
}