import {z} from "zod";
import {validateDate} from "./dateTime.validation";

export const ClientInputSchema = z.object({
    id: z.string().nullish().transform(val => val ?? undefined),
    legalName: z.string().nullish().transform(val => val ?? undefined),
    name: z.string().nullish().transform(val => val ?? undefined),
    dateOfBirth: z.string().nullish().transform(val => val ?? undefined),
    sex: z.string().nullish().transform(val => val ?? undefined),
}).superRefine((data, ctx) => {
    if(!data.id) {
        ctx.addIssue({code: "custom", path: ["id"], message: "Client ID is required"});
    }
    if(!data.legalName) {
        ctx.addIssue({code: "custom", path: ["legalName"], message: "Legal name is required"});
    } else if(data.legalName.split(" ").length === 1) {
        ctx.addIssue({code: "custom", path: ["legalName"], message: "Legal name requires a first name and last name"});
    }
    const dobError = validateDate(data.dateOfBirth ?? "", "Date of Birth", "past");
    if(dobError) {
        ctx.addIssue({code: "custom", path: ["dateOfBirth"], message: dobError});
    }
    if (!data.sex) {
        ctx.addIssue({ code: "custom", path: ["sex"], message: "Sex is required"});
    } else if(!["M", "F"].includes(data.sex)) {
        ctx.addIssue({ code: "custom", path: ["sex"], message: "Invalid sex type"});
    }
});