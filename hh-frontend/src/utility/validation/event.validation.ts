import {z} from "zod";
import {validateDate, validateTime} from "./dateTime.validation";
import {validateNumber} from "./number.validation";

const medicalSchema = z.object({
    recordNumber: z.string().optional(),
    doctor: z.string().optional(),
    doctorType: z.string().optional(),
    appointmentForCondition: z.string().optional(),
});

export const EventInputSchema = z
    .object({
        id: z.string().optional(),
        type: z.string().optional(),
        description: z.string().optional(),
        beginDate: z.string().optional(),
        endDate: z.string().optional(),
        beginTime: z.string().optional(),
        endTime: z.string().optional(),
        numberStaffRequired: z.string().optional(),
        medical: medicalSchema.optional(),
    })
    .superRefine((data, ctx) => {
        if (!data.id) {
            ctx.addIssue({ code: "custom", path: ["id"], message: "Event id is required" });
        }

        if (!data.type) {
            ctx.addIssue({ code: "custom", path: ["type"], message: "Event type is required" });
        } else if (!["SOCIAL", "WORK", "MEDICAL", "OTHER"].includes(data.type)) {
            ctx.addIssue({ code: "custom", path: ["type"], message: "Invalid event type" });
        }

        if (!data.description) {
            ctx.addIssue({ code: "custom", path: ["description"], message: "Description is required" });
        }

        const bdError = validateDate(data.beginDate ?? "", "Begin date", "future");
        if (bdError) {
            ctx.addIssue({ code: "custom", path: ["beginDate"], message: bdError });
        }

        const edError = validateDate(data.endDate ?? "", "End date", "future");
        if (edError) {
            ctx.addIssue({ code: "custom", path: ["endDate"], message: edError });
        }

        const btError = validateTime(data.beginTime ?? "", "Begin time");
        if (btError) {
            ctx.addIssue({ code: "custom", path: ["beginTime"], message: btError });
        }

        const etError = validateTime(data.endTime ?? "", "End time");
        if (etError) {
            ctx.addIssue({ code: "custom", path: ["endTime"], message: etError });
        }

        const staffNumError = validateNumber(data.numberStaffRequired ?? "", "Number of staff", {
            min: 0,
            isInteger: true,
        });
        if (staffNumError) {
            ctx.addIssue({
                code: "custom",
                path: ["numberStaffRequired"],
                message: staffNumError,
            });
        }

        if (data.type === "MEDICAL") {
            const med = data.medical ?? {};
            if (!med.recordNumber) {
                ctx.addIssue({
                    code: "custom",
                    path: ["medical", "recordNumber"],
                    message: "Record number is required",
                });
            }
            if (!med.doctor) {
                ctx.addIssue({
                    code: "custom",
                    path: ["medical", "doctor"],
                    message: "Doctor is required",
                });
            }
            if (!med.doctorType) {
                ctx.addIssue({
                    code: "custom",
                    path: ["medical", "doctorType"],
                    message: "Doctor type is required",
                });
            }
            if (!med.appointmentForCondition) {
                ctx.addIssue({
                    code: "custom",
                    path: ["medical", "appointmentForCondition"],
                    message: "A condition is required",
                });
            }
        }
    });

export const RecordEventActionSchema = z.object({
    action: z.string().optional(),
    results: z.string().optional(),
}).superRefine((data, ctx) => {
    if(!data.action) {
        ctx.addIssue({
            code: "custom",
            path: ["action"],
            message: "Action is required"
        });
    } else if(!["PRINT", "TAKE_TO_HOUSE", "FILE"].includes(data.action)) {
        ctx.addIssue({
            code: "custom",
            path: ["action"],
            message: "Improper action"
        });
    }
    if(data.action && data.action === "FILE" && !data.results) {
        ctx.addIssue({
            code: "custom",
            path: ["results"],
            message: "File action requires results"
        });
    }
});