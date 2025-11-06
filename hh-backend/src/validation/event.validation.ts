import { z } from "zod";
import {isValidDate, isValidMonth, stringIsDefined} from "./utility.validation";

const EventTypeEnum = z.enum(["WORK", "MEDICAL", "SOCIAL", "OTHER"]);
const TimeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const MedicalEventSchema = z.object({
    recordNumber: z.string().max(10),
    recordPrintedDate: z.coerce.date().optional(),
    recordPrintedEmpId: z.string().max(40).optional(),
    recordTakenToHouseDate: z.coerce.date().optional(),
    recordTakenEmpId: z.string().max(40).optional(),
    appointmentCompletedByEmpId: z.string().max(40).optional(),
    recordFiledDate: z.coerce.date().optional(),
    recordFiledEmpId: z.string().max(40).optional(),
    doctor: z.string().max(60),
    doctorType: z.string().max(30),
    appointmentForCondition: z.string().max(50),
    appointmentResults: z.string().optional(),
});

export const EventSchema = z.object({
    id: z.string(),
    type: EventTypeEnum,
    description: z.string(),
    beginDate: z.coerce.date(),
    endDate: z.coerce.date(),
    beginTime: z.string().regex(TimeRegex, "Invalid time format (expected HH:mm)"),
    endTime: z.string().regex(TimeRegex, "Invalid time format (expected HH:mm)"),
    numberStaffRequired: z.number().int().nonnegative(),
    clientId: z.string().max(40),
    medical: MedicalEventSchema.optional(),
});

export const FullEventSchema = EventSchema.superRefine((data, ctx) => {
    if (data.type === "MEDICAL") {
        if (!data.medical) {
            ctx.addIssue({
                path: ["medical"],
                code: z.ZodIssueCode.custom,
                message: "Medical event data is required when type is MEDICAL",
            });
        } else {
            const result = MedicalEventSchema.safeParse(data.medical);
            if (!result.success) {
                result.error.issues.forEach((issue) =>
                    ctx.addIssue({ ...issue, path: ["medical", ...(issue.path || [])] })
                );
            }
        }
    }
});

export type EventInput = z.infer<typeof FullEventSchema>;


export const eventQuerySchema = z
    .object({
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
        month: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        // Validation: ensure mutually exclusive fields, required pairs, and correct formats
// Done in if/else blocks to prevent multiple error messages on a single field
        if (data.month?.trim() === "" || data.fromDate?.trim() === "" || data.toDate?.trim() === "") {
            // Disallow empty string values
            if (data.month?.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["month"],
                    message: "Month must not be an empty string",
                });
            }
            if (data.fromDate?.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["fromDate"],
                    message: "From date must not be an empty string",
                });
            }
            if (data.toDate?.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["toDate"],
                    message: "To date must not be an empty string",
                });
            }
        } else if (data.month && (data.fromDate || data.toDate)) {
            // Cannot provide both a month and from/to dates
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["month"],
                message: "Provide either month OR from/to, not both",
            });
        } else if (data.fromDate && !data.toDate) {
            // 'from' requires a matching 'to'
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["toDate"],
                message: "To date is required if From date is included",
            });
        } else if (data.toDate && !data.fromDate) {
            // 'to' requires a matching 'from'
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["fromDate"],
                message: "From date is required if To date is included",
            });
        } else if (data.month && !isValidMonth(data.month)) {
            // Validate month format
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["month"],
                message: "Invalid month format (YYYY-MM)",
            });
        } else if (data.fromDate) {
            // Both from/to must be valid dates
            if (!isValidDate(data.fromDate)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["fromDate"],
                    message: "Invalid From date format (YYYY-MM-DD)",
                });
            }
            if (!isValidDate(data.toDate!)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["toDate"],
                    message: "Invalid To date format (YYYY-MM-DD)",
                });
            }
        }
    });

