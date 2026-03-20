import {z} from "zod";
import {validateNumber} from "./number.validation";

export const HouseInputSchema = z.object({
    id: z.string().nullish().transform(val => val ?? undefined),
    name: z.string().nullish().transform(val => val ?? undefined),
    street1: z.string().nullish().transform(val => val ?? undefined),
    street2: z.string().nullish().transform(val => val ?? undefined),
    city: z.string().nullish().transform(val => val ?? undefined),
    state: z.string().nullish().transform(val => val ?? undefined),
    maxClients: z.string().nullish().transform(val => val ?? undefined),
    femaleEmployeeOnly: z.boolean().default(false),
}).superRefine((data, ctx) => {
    if(!data.id) {
        ctx.addIssue({code: "custom", path: ["id"], message: "House ID is required"});
    }
    if(!data.name) {
        ctx.addIssue({code: "custom", path: ["name"], message: "House name is required"});
    }
    if(!data.street1) {
        ctx.addIssue({code: "custom", path: ["street1"], message: "Street 1 is required"});
    }
    if(!data.city) {
        ctx.addIssue({code: "custom", path: ["city"], message: "City is required"});
    }
    if(!data.state) {
        ctx.addIssue({code: "custom", path: ["state"], message: "State is required"});
    }
    const maxClientError = validateNumber(data.maxClients, "Max clients", {min: 1, max: 20, isInteger: true, required: true});
    if(maxClientError) {
        ctx.addIssue({code: "custom", path: ["maxClients"], message: maxClientError});
    }
});