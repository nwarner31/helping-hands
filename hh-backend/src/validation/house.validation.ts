import { z } from "zod";
import {optionalNullableString} from "./utility.validation";

export const HouseSchema = z.object({
    id: z.string().min(1, "House ID is required").max(20, "House ID must be at most 20 characters"),
    name: z.string().min(1, "House name is required").max(25, "House name must be at most 25 characters"),
    street1: z.string().min(1, "Street 1 is required").max(50, "Street 1 must be at most 50 characters"),
    street2: optionalNullableString(25),
    city: z.string().min(1, "City is required").max(30, "City must be at most 30 characters"),
    state: z.string().min(1, "State is required").max(25, "State must be at most 25 characters"),
    maxClients: z.coerce.number().min(1, "Max clients must be at least 1").max(20, "Max clients must be at most 20"),
    femaleEmployeeOnly: z.boolean().default(false),
    primaryManagerId: optionalNullableString(40),
    secondaryManagerId: optionalNullableString(40),
});