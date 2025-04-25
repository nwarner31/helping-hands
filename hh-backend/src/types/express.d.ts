// src/types/express.d.ts

import { Employee } from "@prisma/client";

declare module 'express' {
    export interface Request {
        employee?: Employee;  // Or your custom type
    }
}
